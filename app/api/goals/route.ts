import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/firebase-admin"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const snap = await getDb().collection("goals").orderBy("order", "asc").get()
    return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  } catch {
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { label } = await req.json()
    if (!label?.trim()) {
      return NextResponse.json({ error: "Label required" }, { status: 400 })
    }

    // Determine next order value
    const snap = await getDb()
      .collection("goals")
      .orderBy("order", "desc")
      .limit(1)
      .get()
    const maxOrder = snap.empty ? 0 : (snap.docs[0].data().order ?? 0)

    const ref = await getDb().collection("goals").add({
      label: label.trim(),
      active: true,
      order: maxOrder + 1,
      createdAt: new Date(),
    })

    return NextResponse.json({ id: ref.id })
  } catch {
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
