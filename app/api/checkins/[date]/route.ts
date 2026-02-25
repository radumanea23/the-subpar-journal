import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/firebase-admin"

interface Params {
  params: { date: string } // "YYYY-MM-DD"
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const doc = await getDb().collection("checkins").doc(params.date).get()
    if (!doc.exists) {
      return NextResponse.json(null)
    }
    return NextResponse.json({ id: doc.id, ...doc.data() })
  } catch {
    return NextResponse.json({ error: "Failed to fetch check-in" }, { status: 500 })
  }
}
