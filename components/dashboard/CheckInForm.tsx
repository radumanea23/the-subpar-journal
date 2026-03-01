"use client"

import { useState } from "react"
import { todayId } from "@/lib/utils"

// ── Serialisable types (no Date — safe for server→client props) ───────────────
interface GoalEntry {
  id: string
  label: string
  completed: boolean
}

interface GoalRecord {
  id: string
  label: string
  active: boolean
  order: number
}

export interface CheckInRecord {
  id: string
  workout: boolean
  weight?: number | null
  goals: GoalEntry[]
  note?: string | null
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  initialCheckin: CheckInRecord | null
  allGoals: GoalRecord[]
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function CheckInForm({ initialCheckin, allGoals }: Props) {
  // Seed goal entries: use today's snapshot if it exists, otherwise active global goals
  const seedGoals = (): GoalEntry[] => {
    if (initialCheckin?.goals?.length) return initialCheckin.goals
    return allGoals.filter((g) => g.active).map((g) => ({ id: g.id, label: g.label, completed: false }))
  }

  const [workout, setWorkout]       = useState(initialCheckin?.workout ?? false)
  const [weight, setWeight]         = useState(String(initialCheckin?.weight ?? ""))
  const [goalEntries, setGoalEntries] = useState<GoalEntry[]>(seedGoals)
  const [note, setNote]             = useState(initialCheckin?.note ?? "")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")

  // Goal manager state
  const [goals, setGoals]               = useState<GoalRecord[]>(allGoals)
  const [showGoalManager, setShowGoalManager] = useState(false)
  const [newGoalLabel, setNewGoalLabel] = useState("")
  const [goalSaving, setGoalSaving]     = useState(false)

  const completedCount = goalEntries.filter((g) => g.completed).length

  // ── Toggle a goal's completed state ─────────────────────────────────────
  function toggleGoal(id: string) {
    setGoalEntries((prev) => prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)))
  }

  // ── Save check-in ────────────────────────────────────────────────────────
  async function save() {
    setSaveStatus("saving")
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: todayId(),
          workout,
          weight: weight ? parseFloat(weight) : null,
          goals: goalEntries,
          note: note.trim() || null,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2500)
    } catch {
      setSaveStatus("error")
    }
  }

  // ── Add a new global goal ────────────────────────────────────────────────
  async function addGoal() {
    const label = newGoalLabel.trim()
    if (!label) return
    setGoalSaving(true)
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      })
      if (!res.ok) throw new Error()
      const { id } = await res.json()
      const created: GoalRecord = { id, label, active: true, order: goals.length + 1 }
      setGoals((prev) => [...prev, created])
      setGoalEntries((prev) => [...prev, { id, label, completed: false }])
      setNewGoalLabel("")
    } finally {
      setGoalSaving(false)
    }
  }

  // ── Deactivate a global goal ─────────────────────────────────────────────
  async function deactivateGoal(id: string) {
    try {
      await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      })
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, active: false } : g)))
      setGoalEntries((prev) => prev.filter((g) => g.id !== id))
    } catch {
      // silently fail
    }
  }

  const activeGoals = goals.filter((g) => g.active)

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[480px]">

      {/* ── Workout toggle ─────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-3">
          Workout
        </p>
        {/* DESIGN.md: Large toggle — OFF (gray) / ON (green); label in Playfair Display */}
        <button
          type="button"
          onClick={() => setWorkout((v) => !v)}
          className="w-full flex items-center justify-between p-4 bg-dash-surface border"
          style={{ borderColor: workout ? "var(--checkin-full)" : "var(--color-dash-border)" }}
        >
          <span
            className="font-display text-xl font-bold"
            style={{ color: workout ? "var(--checkin-full)" : "var(--color-dash-text-mid)" }}
          >
            Workout
          </span>
          <span
            className="font-mono text-xs tracking-widest uppercase"
            style={{ color: workout ? "var(--checkin-full)" : "var(--color-dash-text-mid)" }}
          >
            {workout ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      {/* ── Weight ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <label className="block font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-3">
          Weight
        </label>
        <div className="flex items-center border border-dash-border bg-dash-surface">
          <input
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0"
            className="flex-1 bg-transparent px-4 py-3 font-mono text-lg text-dash-text focus:outline-none placeholder:text-dash-text-mid"
          />
          <span className="font-mono text-xs text-dash-text-mid px-4 border-l border-dash-border">
            lbs
          </span>
        </div>
      </div>

      {/* ── Goals checklist ────────────────────────────────────────────── */}
      {goalEntries.length > 0 && (
        <div className="mb-6">
          <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-3">
            Goals — {completedCount}/{goalEntries.length}
          </p>
          {/* DESIGN.md: checkboxes styled as squares; checked state filled with --color-dash-accent */}
          <div className="border border-dash-border bg-dash-surface divide-y divide-dash-border">
            {goalEntries.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGoal(g.id)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-dash-border"
              >
                <span
                  className="w-4 h-4 border flex-shrink-0 flex items-center justify-center"
                  style={{
                    borderColor: g.completed ? "var(--color-dash-accent)" : "var(--color-dash-border)",
                    backgroundColor: g.completed ? "var(--color-dash-accent)" : "transparent",
                  }}
                >
                  {g.completed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="var(--color-ink)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className="font-body text-sm"
                  style={{ color: g.completed ? "var(--color-dash-text)" : "var(--color-dash-text-mid)" }}
                >
                  {g.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Note ───────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <label className="block font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-3">
          Note
        </label>
        {/* DESIGN.md: Simple textarea, no toolbar */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Anything to note about today…"
          className="w-full bg-dash-surface border border-dash-border px-4 py-3 font-body text-sm text-dash-text resize-none focus:outline-none focus:border-dash-accent placeholder:text-dash-text-mid"
        />
      </div>

      {/* ── Submit ─────────────────────────────────────────────────────── */}
      {/* DESIGN.md: Full-width, --color-dash-accent bg, --color-ink text, Playfair Display */}
      <div className="flex items-center gap-4 mb-10">
        <button
          type="button"
          onClick={save}
          disabled={saveStatus === "saving"}
          className="flex-1 font-display text-base font-bold py-3.5 bg-dash-accent text-ink disabled:opacity-40"
        >
          {saveStatus === "saving" ? "Saving…" : "Save Check-In"}
        </button>
        {saveStatus === "saved" && (
          <span className="font-mono text-xs text-dash-text-mid">Saved</span>
        )}
        {saveStatus === "error" && (
          <span className="font-mono text-xs text-red-400">Error — try again</span>
        )}
      </div>

      <hr className="border-dash-border mb-6" />

      {/* ── Goal manager ───────────────────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => setShowGoalManager((v) => !v)}
          className="font-mono text-xs tracking-widest text-dash-text-mid uppercase hover:text-dash-text mb-4 flex items-center gap-2"
        >
          <span>{showGoalManager ? "▴" : "▾"}</span>
          <span>Manage Goals</span>
        </button>

        {showGoalManager && (
          <div className="space-y-2">
            {activeGoals.length === 0 && (
              <p className="font-mono text-xs text-dash-text-mid px-4 py-3 border border-dash-border">
                No active goals.
              </p>
            )}
            {activeGoals.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between px-4 py-2.5 border border-dash-border bg-dash-surface"
              >
                <span className="font-body text-sm text-dash-text">{g.label}</span>
                <button
                  type="button"
                  onClick={() => deactivateGoal(g.id)}
                  className="font-mono text-xs text-dash-text-mid hover:text-red-400 ml-4 flex-shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Add new goal row */}
            <div className="flex border border-dash-border">
              <input
                type="text"
                value={newGoalLabel}
                onChange={(e) => setNewGoalLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGoal()}
                placeholder="New goal…"
                className="flex-1 bg-dash-surface px-4 py-2.5 font-body text-sm text-dash-text focus:outline-none placeholder:text-dash-text-mid"
              />
              <button
                type="button"
                onClick={addGoal}
                disabled={!newGoalLabel.trim() || goalSaving}
                className="font-mono text-xs tracking-widest uppercase px-4 border-l border-dash-border text-dash-text-mid hover:text-dash-text disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
