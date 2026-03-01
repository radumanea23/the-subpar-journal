import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/firebase-admin"

interface Params {
  params: { id: string }
}

export async function PUT(req: Request, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    await getDb()
      .collection("goals")
      .doc(params.id)
      .update({ ...body, updatedAt: new Date() })
    return NextResponse.json({ id: params.id })
  } catch {
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}
