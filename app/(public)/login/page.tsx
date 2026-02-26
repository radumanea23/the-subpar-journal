import { signIn } from "@/lib/auth"

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <hr className="rule-heavy w-16 mb-10" />

      <p className="font-mono text-xs tracking-widest text-ink-faint uppercase mb-2">
        Private access
      </p>
      <h1 className="font-display text-4xl font-black text-ink mb-4">
        Hey, Radu.
      </h1>
      <p className="font-body text-sm text-ink-mid leading-relaxed max-w-xs text-center mb-10">
        If you aren&apos;t — our sincere condolences. This section of the
        Journal is a private life agenda: the kind people once kept behind
        locked doors, and now is kept behind OAuth. (:
      </p>

      <form
        action={async () => {
          "use server"
          await signIn("github", { redirectTo: "/dashboard" })
        }}
      >
        <button
          type="submit"
          className="font-mono text-xs tracking-widest text-ink uppercase border border-rule px-8 py-3 hover:bg-parchment-dark"
        >
          Sign in with GitHub
        </button>
      </form>

      <hr className="rule-light w-16 mt-10" />
    </main>
  )
}
