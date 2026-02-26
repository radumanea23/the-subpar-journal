export default function DashboardPage() {
  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-2">
        Overview
      </p>
      <h1 className="font-display text-3xl font-bold text-dash-text mb-8">
        Dashboard
      </h1>
      <hr className="border-dash-border mb-8" />

      {/* Phase 3: Replace with real quick-stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Published Posts", value: "0" },
          { label: "Current Streak", value: "0" },
          { label: "Open Projects", value: "0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-dash-surface border border-dash-border p-6"
          >
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
