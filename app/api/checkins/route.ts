import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/firebase-admin"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const year = searchParams.get("year") ?? new Date().getFullYear().toString()

  try {
    const snapshot = await getDb()
      .collection("checkins")
      .where("id", ">=", `${year}-01-01`)
      .where("id", "<=", `${year}-12-31`)
      .orderBy("id", "desc")
      .get()

    const checkins = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(checkins)
  } catch {
    return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const now = new Date()
    // id is "YYYY-MM-DD" — upsert so re-submitting today's form overwrites
    await getDb()
      .collection("checkins")
      .doc(body.id)
      .set({ ...body, updatedAt: now, createdAt: now }, { merge: true })

    return NextResponse.json({ id: body.id })
  } catch {
    return NextResponse.json({ error: "Failed to save check-in" }, { status: 500 })
  }
}
