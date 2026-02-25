"use client"

// Phase 4: Install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image
// and replace this placeholder with the full TipTap implementation.

interface Props {
  content: string
  onChange: (content: string) => void
}

export default function Editor({ content, onChange }: Props) {
  return (
    <div className="border border-dash-border bg-parchment min-h-[400px] p-6">
      <p className="font-mono text-xs text-ink-faint">
        Rich text editor — Phase 4
      </p>
      {/* Render raw content for now */}
      <textarea
        className="w-full h-96 bg-transparent font-body text-ink text-sm resize-none focus:outline-none mt-4"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing..."
      />
    </div>
  )
}
