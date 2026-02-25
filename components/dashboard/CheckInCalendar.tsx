"use client"

// Phase 5: Receive real check-in data and render color-coded calendar.

import type { CheckIn } from "@/types"

interface Props {
  checkins: CheckIn[]
  year: number
}

function getColor(checkin: CheckIn | undefined): string {
  if (!checkin) return "var(--checkin-empty-dark)"
  const total = checkin.goals.length
  const done = checkin.goals.filter((g) => g.completed).length
  if (total === 0) return "var(--checkin-minimal)"
  if (done === total) return "var(--checkin-full)"
  if (done > 0) return "var(--checkin-partial)"
  return "var(--checkin-minimal)"
}

export default function CheckInCalendar({ checkins, year }: Props) {
  const byDate = Object.fromEntries(checkins.map((c) => [c.id, c]))

  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="font-mono text-xs text-dash-text-mid text-center pb-1">
            {d}
          </div>
        ))}

        {/* Phase 5: generate real day cells from year */}
        {Array.from({ length: 35 }).map((_, i) => {
          const date = `${year}-01-${String(i + 1).padStart(2, "0")}`
          const checkin = byDate[date]
          return (
            <div
              key={i}
              title={date}
              style={{ backgroundColor: getColor(checkin) }}
              className="aspect-square w-full"
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4">
        {[
          { color: "var(--checkin-full)", label: "All goals" },
          { color: "var(--checkin-partial)", label: "Partial" },
          { color: "var(--checkin-minimal)", label: "Checked in" },
          { color: "var(--checkin-empty-dark)", label: "No entry" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3" style={{ backgroundColor: color }} />
            <span className="font-mono text-xs text-dash-text-mid">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
