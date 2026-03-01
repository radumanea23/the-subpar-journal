import { getDb } from "@/lib/firebase-admin"
import { todayId } from "@/lib/utils"
import CheckInForm, { type CheckInRecord } from "@/components/dashboard/CheckInForm"

interface GoalRecord {
  id: string
  label: string
  active: boolean
  order: number
}

export default async function CheckInPage() {
  const today = todayId()

  // ── Fetch today's check-in ─────────────────────────────────────────────
  let initialCheckin: CheckInRecord | null = null
  try {
    const doc = await getDb().collection("checkins").doc(today).get()
    if (doc.exists) {
      const d = doc.data()!
      initialCheckin = {
        id: doc.id,
        workout: d.workout ?? false,
        weight: d.weight ?? null,
        goals: (d.goals ?? []) as CheckInRecord["goals"],
        note: d.note ?? null,
      }
    }
  } catch {
    // Firestore unavailable — render empty form
  }

  // ── Fetch all goals ────────────────────────────────────────────────────
  let allGoals: GoalRecord[] = []
  try {
    const snap = await getDb().collection("goals").orderBy("order", "asc").get()
    allGoals = snap.docs.map((d) => ({
      id: d.id,
      label: d.data().label as string,
      active: d.data().active ?? true,
      order: d.data().order ?? 0,
    }))
  } catch {
    // Render with empty goals list
  }

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-1">
        Daily Check-In
      </p>
      <h1 className="font-display text-3xl font-bold text-dash-text mb-6">
        Today
      </h1>
      <hr className="border-dash-border mb-8" />
      <CheckInForm initialCheckin={initialCheckin} allGoals={allGoals} />
    </div>
  )
}
