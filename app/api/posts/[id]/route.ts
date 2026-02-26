import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/firebase-admin"

interface Params {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const doc = await getDb().collection("posts").doc(params.id).get()
    if (!doc.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    return NextResponse.json({ id: doc.id, ...doc.data() })
  } catch {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Params) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const now = new Date()
    // _setPublishedAt is a client-side flag meaning "first publish — set timestamp now"
    const { _setPublishedAt, ...update } = body
    await getDb().collection("posts").doc(params.id).update({
      ...update,
      updatedAt: now,
      ...(_setPublishedAt ? { publishedAt: now } : {}),
    })
    return NextResponse.json({ id: params.id })
  } catch {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await getDb().collection("posts").doc(params.id).delete()
    return NextResponse.json({ id: params.id })
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
