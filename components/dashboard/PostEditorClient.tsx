"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Editor from "@/components/dashboard/Editor"
import ImageUpload from "@/components/dashboard/ImageUpload"
import { slugify } from "@/lib/utils"
import type { Category, Post } from "@/types"

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES: { value: Category; label: string }[] = [
  { value: "ai", label: "AI" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "stocks", label: "Stocks" },
  { value: "life", label: "Life" },
]

type SaveStatus = "idle" | "saving" | "saved" | "error"

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  initialPost?: Post
}

// ── Shared input/textarea class ────────────────────────────────────────────────
const fieldClass =
  "w-full bg-dash-bg border border-dash-border px-3 py-2 font-mono text-xs text-dash-text focus:outline-none focus:border-dash-accent"

// ── Component ──────────────────────────────────────────────────────────────────
export default function PostEditorClient({ initialPost }: Props) {
  const router = useRouter()
  const isEdit = !!initialPost

  const [title, setTitle] = useState(initialPost?.title ?? "")
  const [slug, setSlug] = useState(initialPost?.slug ?? "")
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "")
  const [category, setCategory] = useState<Category>(
    initialPost?.category ?? "ai",
  )
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage ?? "")
  const [content, setContent] = useState(initialPost?.content ?? "")
  const [published, setPublished] = useState(initialPost?.published ?? false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")

  // Auto-generate slug from title only for new posts
  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value)
      if (!isEdit) setSlug(slugify(value))
    },
    [isEdit],
  )

  // ── Save / publish ─────────────────────────────────────────────────────────
  async function save(publishNow?: boolean) {
    const willPublish = publishNow ?? published
    setSaveStatus("saving")

    try {
      const isFirstPublish = willPublish && !initialPost?.publishedAt
      const body = {
        title,
        slug,
        excerpt,
        category,
        content,
        coverImage: coverImage || null,
        published: willPublish,
        // Let server set publishedAt on first publish; flag tells PUT route to do so
        ...(isFirstPublish ? { _setPublishedAt: true } : {}),
      }

      if (isEdit) {
        const res = await fetch(`/api/posts/${initialPost!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(await res.text())
      } else {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        // Navigate to edit page so subsequent saves use PUT
        router.replace(`/dashboard/editor/${data.id}`)
        return
      }

      setPublished(willPublish)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2500)
    } catch {
      setSaveStatus("error")
    }
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving…",
    saved: "Saved",
    error: "Error — try again",
  }

  return (
    <div>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-1">
            Blog Editor
          </p>
          <h1 className="font-display text-3xl font-bold text-dash-text">
            {isEdit ? "Edit Post" : "New Post"}
          </h1>
        </div>

        <div className="flex items-center gap-4 pt-1">
          {statusLabel[saveStatus] && (
            <span
              className={
                "font-mono text-xs " +
                (saveStatus === "error" ? "text-red-400" : "text-dash-text-mid")
              }
            >
              {statusLabel[saveStatus]}
            </span>
          )}
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saveStatus === "saving"}
            className="font-mono text-xs tracking-widest uppercase px-5 py-2.5 border border-dash-border text-dash-text hover:bg-dash-border disabled:opacity-40"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={saveStatus === "saving"}
            className="font-mono text-xs tracking-widest uppercase px-5 py-2.5 bg-dash-accent text-ink disabled:opacity-40"
          >
            {published ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <hr className="border-dash-border mb-8 mt-0" />

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_272px] gap-8 items-start">
        {/* ── Left: title + editor ─────────────────────────────────────── */}
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
            className="w-full bg-transparent font-display text-2xl font-bold text-dash-text placeholder:text-dash-text-mid border-b border-dash-border pb-3 focus:outline-none focus:border-dash-accent"
          />
          <Editor content={content} onChange={setContent} />
        </div>

        {/* ── Right: metadata panel ────────────────────────────────────── */}
        <div className="space-y-5 border border-dash-border p-5 bg-dash-surface">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-widest text-dash-text-mid uppercase">
              Status
            </span>
            <span
              className={
                "font-mono text-xs tracking-widest uppercase " +
                (published ? "text-dash-accent" : "text-dash-text-mid")
              }
            >
              {published ? "Published" : "Draft"}
            </span>
          </div>

          <hr className="border-dash-border" />

          {/* Slug */}
          <div>
            <label className="block font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-1.5">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={fieldClass}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={fieldClass + " appearance-none"}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-1.5">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={4}
              placeholder="Brief summary for card previews…"
              className={fieldClass + " font-body text-sm resize-none placeholder:text-dash-text-mid"}
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="block font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-1.5">
              Cover Image
            </label>
            {coverImage ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-32 object-cover border border-dash-border"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="font-mono text-xs text-dash-text-mid hover:text-dash-text"
                >
                  Remove
                </button>
              </div>
            ) : (
              <ImageUpload onUpload={setCoverImage} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
