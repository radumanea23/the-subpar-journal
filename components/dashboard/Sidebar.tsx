"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { handleSignOut } from "@/app/actions/auth"

const navSections = [
  {
    label: "Content",
    items: [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/editor", label: "New Post" },
    ],
  },
  {
    label: "Tracking",
    items: [
      { href: "/dashboard/checkin", label: "Check-In" },
      { href: "/dashboard/calendar", label: "Calendar" },
      { href: "/dashboard/analytics", label: "Analytics" },
    ],
  },
  {
    label: "Work",
    items: [{ href: "/dashboard/projects", label: "Projects" }],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-dash-surface border-r border-dash-border flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-dash-border">
        <p className="font-display text-sm font-bold text-dash-text leading-tight">
          The Subpar
          <br />
          Journal
        </p>
        <p className="font-mono text-xs text-dash-text-mid mt-1">Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="px-5 mb-1 font-mono text-xs tracking-widest text-dash-text-mid uppercase">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "block px-5 py-2.5 font-mono text-xs border-l-2 " +
                    (isActive
                      ? "border-dash-accent text-dash-accent"
                      : "border-transparent text-dash-text hover:bg-dash-border")
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-dash-border p-5">
        <form action={handleSignOut}>
          <button
            type="submit"
            className="font-mono text-xs tracking-widest text-dash-text-mid uppercase hover:text-dash-text"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
