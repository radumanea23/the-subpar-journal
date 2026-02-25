"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-parchment flex flex-col items-center justify-center px-4">
      <hr className="rule-heavy w-24 mb-8" />
      <p className="font-mono text-xs tracking-widest text-ink-faint uppercase mb-4">
        Something went wrong
      </p>
      <h1 className="font-display text-3xl font-black text-ink mb-8 text-center">
        An error occurred
      </h1>
      <button
        onClick={reset}
        className="font-mono text-xs tracking-widest text-ink uppercase border border-rule px-4 py-2 hover:bg-parchment-dark transition-colors duration-150"
      >
        Try again
      </button>
    </main>
  )
}
