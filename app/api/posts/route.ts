import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    const db = getDb()
    const snapshot = await db
      .collection("posts")
      .where("published", "==", true)
      .orderBy("publishedAt", "desc")
      .get()

    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(posts)
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
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
    const ref = await getDb().collection("posts").add({
      ...body,
      createdAt: now,
      updatedAt: now,
      publishedAt: body.published ? now : null,
    })
    return NextResponse.json({ id: ref.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
