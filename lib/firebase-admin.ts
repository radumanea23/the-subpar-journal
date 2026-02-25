import { getApps, initializeApp, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

// Lazily initialised — firebase-admin validates credentials at init time,
// so we must not call initializeApp at module load (build would fail without env vars).
let _app: App | undefined
let _db: Firestore | undefined

export function getDb(): Firestore {
  if (_db) return _db

  if (!_app) {
    const existing = getApps()
    _app =
      existing.length > 0
        ? existing[0]
        : initializeApp({
            credential: cert({
              projectId: process.env.GCP_PROJECT_ID,
              clientEmail: process.env.GCP_CLIENT_EMAIL,
              // Vercel stores newlines as \n literals; convert them back
              privateKey: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
          })
  }

  _db = getFirestore(_app)
  return _db
}
