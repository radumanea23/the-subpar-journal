import { Storage } from "@google-cloud/storage"
import { randomUUID } from "crypto"

// Initialised lazily inside the function so GCS is never contacted at build time
// when env vars aren't present.
function getStorage() {
  return new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
  })
}

export async function getSignedUploadUrl(
  originalFilename: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const ext = originalFilename.split(".").pop() ?? "bin"
  const filename = `images/${randomUUID()}.${ext}`

  const bucket = getStorage().bucket(process.env.GCS_BUCKET_NAME!)
  const file = bucket.file(filename)

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  })

  const publicUrl = `${process.env.GCS_PUBLIC_URL_BASE}/${filename}`
  return { uploadUrl, publicUrl }
}
