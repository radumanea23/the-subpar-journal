"use client"

// Phase 5: Connect to /api/checkins POST and load today's existing check-in.

import { useState } from "react"
import type { Goal } from "@/types"

interface Props {
  goals: Goal[]
  date: string // "YYYY-MM-DD"
}

export default function CheckInForm({ goals, date }: Props) {
  const [workout, setWorkout] = useState(false)
  const [weight, setWeight] = useState("")
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [note, setNote] = useState("")

  function toggleGoal(id: string) {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: date,
        workout,
        weight: weight ? parseFloat(weight) : null,
        goals: goals.map((g) => ({ id: g.id, label: g.label, completed: !!completed[g.id] })),
        note,
      }),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-6">
      {/* Workout toggle */}
      <div>
        <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-3">
          Workout
        </p>
        <button
          type="button"
          onClick={() => setWorkout(!workout)}
          className={`w-full py-3 font-mono text-xs tracking-widest uppercase border transition-colors duration-150 ${
            workout
              ? "bg-checkin-full border-checkin-full text-white"
              : "bg-dash-surface border-dash-border text-dash-text-mid"
          }`}
        >
          {workout ? "Done" : "Not done"}
        </button>
      </div>

      {/* Weight */}
      <div>
        <label className="font-mono text-xs tracking-widest text-dash-text-mid uppercase block mb-2">
          Weight (kg)
        </label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full bg-dash-surface border border-dash-border px-3 py-2 font-mono text-sm text-dash-text focus:outline-none focus:border-dash-accent"
          placeholder="—"
        />
      </div>

      {/* Goals */}
      {goals.length > 0 && (
        <div>
          <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-3">
            Goals
          </p>
          <div className="space-y-2">
            {goals.map((goal) => (
              <label key={goal.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!completed[goal.id]}
                  onChange={() => toggleGoal(goal.id)}
                  className="w-4 h-4 accent-dash-accent"
                />
                <span className="font-body text-sm text-dash-text">{goal.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div>
        <label className="font-mono text-xs tracking-widest text-dash-text-mid uppercase block mb-2">
          Note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full bg-dash-surface border border-dash-border px-3 py-2 font-body text-sm text-dash-text resize-none focus:outline-none focus:border-dash-accent"
          placeholder="Optional..."
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-dash-accent text-ink font-mono text-xs tracking-widest uppercase hover:opacity-90 transition-opacity duration-150"
      >
        Save
      </button>
    </form>
  )
}
