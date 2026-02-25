"use client"

// Phase 6: Install recharts and build out all chart components.

interface StatCardProps {
  value: string | number
  label: string
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="bg-dash-surface border border-dash-border p-6">
      <p className="font-display text-4xl font-bold text-dash-text mb-2">{value}</p>
      <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase">{label}</p>
    </div>
  )
}

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value="—" label="Current Streak" />
        <StatCard value="—" label="Longest Streak" />
        <StatCard value="—" label="Workouts This Year" />
        <StatCard value="—" label="Goals Completed" />
      </div>

      {/* Phase 6: Weight trend chart */}
      <div className="bg-dash-surface border border-dash-border p-6">
        <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-4">
          Weight Trend
        </p>
        <div className="h-40 flex items-center justify-center">
          <p className="font-mono text-xs text-dash-text-mid">Chart — Phase 6</p>
        </div>
      </div>

      {/* Phase 6: Post volume chart */}
      <div className="bg-dash-surface border border-dash-border p-6">
        <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-4">
          Post Volume
        </p>
        <div className="h-40 flex items-center justify-center">
          <p className="font-mono text-xs text-dash-text-mid">Chart — Phase 6</p>
        </div>
      </div>
    </div>
  )
}
