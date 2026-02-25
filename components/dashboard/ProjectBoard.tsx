"use client"

// Phase 7: Connect to /api/projects and add drag-and-drop between columns.

import type { Project, ProjectStatus } from "@/types"

const columns: { status: ProjectStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "active", label: "Active" },
  { status: "done", label: "Done" },
]

const priorityColors: Record<string, string> = {
  low: "var(--color-ink-faint)",
  medium: "var(--color-dash-accent)",
  high: "var(--color-accent-sports)",
}

interface Props {
  projects: Project[]
}

export default function ProjectBoard({ projects }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {columns.map(({ status, label }) => {
        const col = projects.filter((p) => p.status === status)
        return (
          <div key={status} className="bg-dash-surface border border-dash-border">
            {/* Column header */}
            <div className="px-4 py-3 border-b border-dash-border flex items-center justify-between">
              <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase">
                {label}
              </p>
              <span className="font-mono text-xs text-dash-text-mid">{col.length}</span>
            </div>

            {/* Cards */}
            <div className="p-3 space-y-2 min-h-[200px]">
              {col.map((project) => (
                <div
                  key={project.id}
                  className="bg-dash-bg border border-dash-border p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-body text-sm font-bold text-dash-text leading-tight">
                      {project.title}
                    </p>
                    <div
                      className="w-2 h-2 shrink-0 rounded-full mt-1"
                      style={{ backgroundColor: priorityColors[project.priority] }}
                    />
                  </div>
                  {project.tasks.length > 0 && (
                    <p className="font-mono text-xs text-dash-text-mid">
                      {project.tasks.filter((t) => t.done).length}/{project.tasks.length} tasks
                    </p>
                  )}
                </div>
              ))}

              {col.length === 0 && (
                <div className="flex items-center justify-center h-20">
                  <p className="font-mono text-xs text-dash-text-mid">Empty</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
