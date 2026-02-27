"use client"

import { useState } from "react"
import type { Post, Category } from "@/types"
import PostCard from "./PostCard"

// ── Filter options ─────────────────────────────────────────────────────────────
type Filter = "all" | Category

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all",    label: "All"    },
  { value: "ai",     label: "AI"     },
  { value: "music",  label: "Music"  },
  { value: "sports", label: "Sports" },
  { value: "stocks", label: "Stocks" },
  { value: "life",   label: "Life"   },
]

const ACCENT: Record<Category, string> = {
  ai:     "var(--color-accent-ai)",
  music:  "var(--color-accent-music)",
  sports: "var(--color-accent-sports)",
  stocks: "var(--color-accent-stocks)",
  life:   "var(--color-accent-life)",
}

function activeColor(filter: Filter): string {
  return filter === "all" ? "var(--color-rule)" : ACCENT[filter as Category]
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  posts: Post[]
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function BlogFeedFiltered({ posts }: Props) {
  const [active, setActive] = useState<Filter>("all")

  const visible =
    active === "all" ? posts : posts.filter((p) => p.category === active)

  return (
    <div>
      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="flex items-end gap-0 mb-6 border-b border-rule-light">
        {FILTERS.map((f, i) => {
          const isActive = active === f.value
          return (
            <div key={f.value} className="flex items-center">
              {i > 0 && (
                <span
                  className="font-mono text-xs text-rule-light select-none px-1"
                  aria-hidden
                >
                  ·
                </span>
              )}
              <button
                type="button"
                onClick={() => setActive(f.value)}
                className={
                  "font-mono text-xs tracking-widest uppercase px-3 py-2.5 " +
                  (isActive ? "text-ink" : "text-ink-faint hover:text-ink-mid")
                }
                style={{
                  borderBottom: `2px solid ${isActive ? activeColor(f.value) : "transparent"}`,
                  marginBottom: "-1px",
                }}
              >
                {f.label}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Post grid ───────────────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <hr className="rule-light w-16 mb-8" />
          <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
            No entries yet
          </p>
          <hr className="rule-light w-16 mt-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
