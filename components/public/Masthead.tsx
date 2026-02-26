export default function Masthead() {
  return (
    <header className="border-t-[3px] border-rule">
      <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          {/* Site identity */}
          <div>
            <h1 className="font-display font-black leading-none tracking-tight text-ink"
              style={{ fontSize: "var(--text-masthead)" }}>
              The Subpar Journal
            </h1>
          </div>

          {/* External links + sign in */}
          <nav className="flex items-center gap-6">
            <a
              href="https://github.com/radumanea23"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-widest text-ink-mid uppercase hover:underline underline-offset-4"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/radumanea/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-widest text-ink-mid uppercase hover:underline underline-offset-4"
            >
              LinkedIn
            </a>
            <a
              href="/login"
              className="font-mono text-xs tracking-widest text-ink-faint uppercase hover:underline underline-offset-4"
            >
              Sign In
            </a>
          </nav>
        </div>
      </div>
      <hr className="rule-mid m-0" />
    </header>
  )
}
