"use client"

import { useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"

// ── Toolbar button ─────────────────────────────────────────────────────────────
function Btn({
  onClick,
  active,
  children,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault() // keep editor focus
        onClick()
      }}
      className={
        "px-2.5 py-1 font-mono text-xs " +
        (active
          ? "bg-dash-accent text-ink"
          : "text-dash-text hover:bg-dash-border")
      }
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="w-px h-4 bg-dash-border mx-1 self-center" />
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  content: string
  onChange: (html: string) => void
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function Editor({ content, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: content || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // ── Image upload ─────────────────────────────────────────────────────────────
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      const { uploadUrl, publicUrl } = await res.json()
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })
      editor.chain().focus().setImage({ src: publicUrl }).run()
    },
    [editor],
  )

  const handleImageButton = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleImageUpload(file)
    }
    input.click()
  }, [handleImageUpload])

  // ── Link ─────────────────────────────────────────────────────────────────────
  const handleLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL", prev ?? "https://")
    if (url === null) return // cancelled
    if (url === "") {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return null

  const a = editor.isActive.bind(editor)

  return (
    <div className="border border-dash-border flex flex-col">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-dash-surface border-b border-dash-border">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={a("bold")}>
          B
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={a("italic")}>
          I
        </Btn>
        <Divider />
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={a("heading", { level: 2 })}
        >
          H2
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={a("heading", { level: 3 })}
        >
          H3
        </Btn>
        <Divider />
        <Btn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={a("bulletList")}
        >
          UL
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={a("orderedList")}
        >
          OL
        </Btn>
        <Divider />
        <Btn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={a("blockquote")}
        >
          &ldquo;&rdquo;
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={a("codeBlock")}
        >
          {"</>"}
        </Btn>
        <Divider />
        <Btn onClick={handleLink} active={a("link")}>
          Link
        </Btn>
        <Btn onClick={handleImageButton}>Img</Btn>
      </div>

      {/* ── Parchment editor surface ──────────────────────────────────────── */}
      <EditorContent
        editor={editor}
        className="prose-editorial bg-parchment min-h-[480px] p-6"
      />
    </div>
  )
}
