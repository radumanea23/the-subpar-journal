import { getDb } from "@/lib/firebase-admin"

// ── Streak helper (duplicated from CheckInCalendar for server-side use) ────────
function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function prevDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function calcCurrentStreak(dateSet: Set<string>): number {
  const today = localToday()
  const startDate = dateSet.has(today) ? today : prevDay(today)
  if (!dateSet.has(startDate)) return 0
  let streak = 0
  let d = startDate
  while (dateSet.has(d)) { streak++; d = prevDay(d) }
  return streak
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  let publishedPosts = 0
  let currentStreak = 0
  let openProjects = 0

  try {
    const [postsSnap, checkinsSnap, projectsSnap] = await Promise.all([
      getDb().collection("posts").where("published", "==", true).get(),
      getDb().collection("checkins").get(),
      getDb().collection("projects").where("status", "in", ["backlog", "active"]).get(),
    ])

    publishedPosts = postsSnap.size
    openProjects   = projectsSnap.size
    currentStreak  = calcCurrentStreak(new Set(checkinsSnap.docs.map((d) => d.id)))
  } catch {
    // Firestore unavailable — show zeros
  }

  const stats = [
    { label: "Published Posts",  value: String(publishedPosts) },
    { label: "Current Streak",   value: `${currentStreak}d`    },
    { label: "Open Projects",    value: String(openProjects)   },
  ]

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-2">
        Overview
      </p>
      <h1 className="font-display text-3xl font-bold text-dash-text mb-8">
        Dashboard
      </h1>
      <hr className="border-dash-border mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-dash-surface border border-dash-border p-6">
            <p className="font-display text-3xl font-bold text-dash-text mb-2">
              {stat.value}
            </p>
            <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
