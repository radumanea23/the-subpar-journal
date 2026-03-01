import { getDb } from "@/lib/firebase-admin"
import CheckInCalendar from "@/components/dashboard/CheckInCalendar"

interface CheckInRecord {
  id: string
  workout: boolean
  weight?: number | null
  goals: { id: string; label: string; completed: boolean }[]
  note?: string | null
}

export default async function CalendarPage() {
  // Fetch all check-ins (all time) for full streak calculation
  let checkins: CheckInRecord[] = []
  try {
    const snap = await getDb()
      .collection("checkins")
      .orderBy("id", "asc")
      .get()
    checkins = snap.docs.map((d) => ({
      id: d.id,
      workout: d.data().workout ?? false,
      weight: d.data().weight ?? null,
      goals: (d.data().goals ?? []) as CheckInRecord["goals"],
      note: d.data().note ?? null,
    }))
  } catch {
    // Render empty calendar
  }

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-1">
        Check-In History
      </p>
      <h1 className="font-display text-3xl font-bold text-dash-text mb-6">
        Calendar
      </h1>
      <hr className="border-dash-border mb-8" />
      <CheckInCalendar checkins={checkins} />
    </div>
  )
}
