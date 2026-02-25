import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSignedUploadUrl } from "@/lib/storage"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { filename, contentType } = await req.json()

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      )
    }

    const result = await getSignedUploadUrl(filename, contentType)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
