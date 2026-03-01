"use client"

import { useState, useMemo } from "react"

// ── Serialisable checkin type (no Date objects) ───────────────────────────────
interface CheckInRecord {
  id: string // "YYYY-MM-DD"
  workout: boolean
  weight?: number | null
  goals: { id: string; label: string; completed: boolean }[]
  note?: string | null
}

// ── Status helpers ────────────────────────────────────────────────────────────
type Status = "full" | "partial" | "minimal" | null

function getStatus(c: CheckInRecord | null): Status {
  if (!c) return null
  const goals = c.goals ?? []
  if (goals.length === 0) return "full" // no goals defined = committed = full
  const done = goals.filter((g) => g.completed).length
  if (done === goals.length) return "full"
  if (done > 0) return "partial"
  return "minimal"
}

const STATUS_BG: Record<Exclude<Status, null>, string> = {
  full:    "var(--checkin-full)",
  partial: "var(--checkin-partial)",
  minimal: "var(--checkin-minimal)",
}

// ── Tooltip text ──────────────────────────────────────────────────────────────
function makeTooltip(c: CheckInRecord | null, dateStr: string): string {
  if (!c) return `${dateStr} — No check-in`
  const parts: string[] = [dateStr]
  if (c.workout) parts.push("Workout ✓")
  if (c.weight) parts.push(`${c.weight} lbs`)
  const goals = c.goals ?? []
  const done = goals.filter((g) => g.completed).length
  if (goals.length) parts.push(`Goals ${done}/${goals.length}`)
  if (c.note) parts.push(c.note.slice(0, 60))
  return parts.join(" · ")
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function prevDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00") // noon avoids DST edge cases
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// ── Streak calculation ────────────────────────────────────────────────────────
function calcStreaks(checkinMap: Map<string, CheckInRecord>): {
  current: number
  longest: number
} {
  const dates = Array.from(checkinMap.keys()).sort()
  if (!dates.length) return { current: 0, longest: 0 }

  // Longest streak: scan sorted dates for consecutive runs
  let longest = 1
  let run = 1
  for (let i = 1; i < dates.length; i++) {
    const gap =
      (new Date(dates[i] + "T12:00:00").getTime() -
        new Date(dates[i - 1] + "T12:00:00").getTime()) /
      86_400_000
    if (gap === 1) {
      run++
      if (run > longest) longest = run
    } else {
      run = 1
    }
  }

  // Current streak: walk back from today (or yesterday if today not checked in)
  const today = localToday()
  const startDate = checkinMap.has(today) ? today : prevDay(today)
  let current = 0
  let d = startDate
  while (checkinMap.has(d)) {
    current++
    d = prevDay(d)
  }

  return { current, longest }
}

// ── Calendar helpers ──────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay() // 0=Sun
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  checkins: CheckInRecord[]
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CheckInCalendar({ checkins }: Props) {
  const today = localToday()
  const todayDate = new Date(today + "T12:00:00")

  const [view, setView] = useState<"month" | "year">("month")
  const [year, setYear] = useState(todayDate.getFullYear())
  const [month, setMonth] = useState(todayDate.getMonth())

  // O(1) lookup map
  const checkinMap = useMemo(() => {
    const map = new Map<string, CheckInRecord>()
    checkins.forEach((c) => map.set(c.id, c))
    return map
  }, [checkins])

  const { current: currentStreak, longest: longestStreak } = useMemo(
    () => calcStreaks(checkinMap),
    [checkinMap]
  )

  // ── Month navigation ─────────────────────────────────────────────────────
  function goPrev() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function goNext() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }
  function goToday() {
    setMonth(todayDate.getMonth())
    setYear(todayDate.getFullYear())
  }

  // ── Month grid cells ─────────────────────────────────────────────────────
  // null = empty leading/trailing cell, number = day-of-month
  const monthCells: (number | null)[] = [
    ...Array<null>(firstDayOfWeek(year, month)).fill(null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
  ]
  while (monthCells.length % 7 !== 0) monthCells.push(null)

  // ── Year grid (53 week-columns × 7 day-rows) ─────────────────────────────
  const yearGrid = useMemo(() => {
    const jan1 = new Date(year, 0, 1)
    const startDow = jan1.getDay()
    // Sunday of the week containing Jan 1
    const startDate = new Date(year, 0, 1 - startDow)

    const weeks: { date: string; inYear: boolean; month: number }[][] = []
    for (let w = 0; w < 53; w++) {
      const week: { date: string; inYear: boolean; month: number }[] = []
      for (let d = 0; d < 7; d++) {
        const cell = new Date(startDate)
        cell.setDate(startDate.getDate() + w * 7 + d)
        week.push({
          date: `${cell.getFullYear()}-${String(cell.getMonth() + 1).padStart(2, "0")}-${String(cell.getDate()).padStart(2, "0")}`,
          inYear: cell.getFullYear() === year,
          month: cell.getMonth(),
        })
      }
      weeks.push(week)
    }
    return weeks
  }, [year])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>

      {/* ── Streak stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-dash-surface border border-dash-border p-5">
          <p className="font-display text-3xl font-bold text-dash-text mb-1">{currentStreak}</p>
          <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase">Current Streak</p>
        </div>
        <div className="bg-dash-surface border border-dash-border p-5">
          <p className="font-display text-3xl font-bold text-dash-text mb-1">{longestStreak}</p>
          <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase">Longest Streak</p>
        </div>
      </div>

      {/* ── View toggle + navigation ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        {/* Month / Year toggle buttons */}
        <div className="flex border border-dash-border">
          {(["month", "year"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={
                "font-mono text-xs tracking-widest uppercase px-4 py-2 " +
                (view === v ? "bg-dash-accent text-ink" : "text-dash-text-mid hover:text-dash-text")
              }
            >
              {v}
            </button>
          ))}
        </div>

        {/* Month navigation */}
        {view === "month" && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={goPrev} className="font-mono text-xs text-dash-text-mid hover:text-dash-text px-2">←</button>
            <span className="font-mono text-xs tracking-widest uppercase text-dash-text min-w-[140px] text-center">
              {MONTH_NAMES[month].toUpperCase()} {year}
            </span>
            <button type="button" onClick={goNext} className="font-mono text-xs text-dash-text-mid hover:text-dash-text px-2">→</button>
            {(month !== todayDate.getMonth() || year !== todayDate.getFullYear()) && (
              <button
                type="button"
                onClick={goToday}
                className="font-mono text-xs tracking-widest uppercase text-dash-text-mid hover:text-dash-text ml-1"
              >
                Today
              </button>
            )}
          </div>
        )}

        {/* Year navigation */}
        {view === "year" && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setYear((y) => y - 1)} className="font-mono text-xs text-dash-text-mid hover:text-dash-text px-2">←</button>
            <span className="font-mono text-xs tracking-widest uppercase text-dash-text">{year}</span>
            <button type="button" onClick={() => setYear((y) => y + 1)} className="font-mono text-xs text-dash-text-mid hover:text-dash-text px-2">→</button>
          </div>
        )}
      </div>

      {/* ── Month view ─────────────────────────────────────────────────── */}
      {view === "month" && (
        <div className="border border-dash-border bg-dash-surface p-4">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="font-mono text-xs text-dash-text-mid text-center py-1">
                {d}
              </div>
            ))}
          </div>
          {/* Day cells — DESIGN.md: 28–32px square, colour-coded, today has accent border */}
          <div className="grid grid-cols-7 gap-1">
            {monthCells.map((day, i) => {
              if (day === null) return <div key={i} />
              const id = dateStr(year, month, day)
              const checkin = checkinMap.get(id) ?? null
              const status = getStatus(checkin)
              const isToday = id === today
              return (
                <div
                  key={i}
                  title={makeTooltip(checkin, id)}
                  className="aspect-square flex items-center justify-center font-mono text-xs cursor-default"
                  style={{
                    backgroundColor: status ? STATUS_BG[status] : "var(--color-dash-border)",
                    color: status ? "rgba(255,255,255,0.75)" : "var(--color-dash-text-mid)",
                    border: isToday
                      ? "2px solid var(--color-dash-accent)"
                      : "2px solid transparent",
                  }}
                >
                  {day}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Year view ──────────────────────────────────────────────────── */}
      {/* DESIGN.md: ~12px condensed cells, GitHub heatmap style */}
      {view === "year" && (
        <div className="border border-dash-border bg-dash-surface p-4 overflow-x-auto">
          <div className="flex gap-0.5">
            {yearGrid.map((week, wi) => {
              // Show month label above the first week of each new month
              const firstInYear = week.find((d) => d.inYear)
              const prevFirstInYear = wi > 0 ? yearGrid[wi - 1].find((d) => d.inYear) : null
              const showLabel =
                firstInYear &&
                (!prevFirstInYear || firstInYear.month !== prevFirstInYear.month)

              return (
                <div key={wi} className="flex flex-col gap-0.5">
                  {/* Month label row */}
                  <div className="h-5 flex items-end">
                    {showLabel && (
                      <span className="font-mono text-xs text-dash-text-mid uppercase leading-none whitespace-nowrap">
                        {MONTH_NAMES[firstInYear!.month].slice(0, 3)}
                      </span>
                    )}
                  </div>
                  {/* 7 day cells for this week */}
                  {week.map((cell, di) => {
                    const checkin = checkinMap.get(cell.date) ?? null
                    const status = getStatus(checkin)
                    const isToday = cell.date === today
                    return (
                      <div
                        key={di}
                        title={cell.inYear ? makeTooltip(checkin, cell.date) : ""}
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: !cell.inYear
                            ? "transparent"
                            : status
                            ? STATUS_BG[status]
                            : "var(--color-dash-border)",
                          outline: isToday ? "1px solid var(--color-dash-accent)" : "none",
                        }}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      {/* DESIGN.md: Inline below calendar, horizontal */}
      <div className="flex items-center gap-6 mt-4 flex-wrap">
        {[
          { color: "var(--checkin-full)",         label: "All goals"  },
          { color: "var(--checkin-partial)",       label: "Partial"    },
          { color: "var(--checkin-minimal)",       label: "Checked in" },
          { color: "var(--color-dash-border)",     label: "No entry"   },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: color }} />
            <span className="font-mono text-xs text-dash-text-mid">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
