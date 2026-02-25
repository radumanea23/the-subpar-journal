import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-parchment flex flex-col items-center justify-center px-4">
      <hr className="rule-heavy w-24 mb-8" />
      <p className="font-mono text-xs tracking-widest text-ink-faint uppercase mb-4">
        Error 404
      </p>
      <h1 className="font-display text-4xl font-black text-ink mb-4 text-center">
        Page Not Found
      </h1>
      <p className="font-body text-ink-mid mb-8 text-center max-w-prose text-sm">
        The entry you were looking for does not exist in this archive.
      </p>
      <hr className="rule-light w-24 mb-8" />
      <Link
        href="/"
        className="font-mono text-xs tracking-widest text-ink uppercase underline-offset-4 hover:underline"
      >
        Return to the journal
      </Link>
    </main>
  )
}
