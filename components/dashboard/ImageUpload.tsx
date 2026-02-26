"use client"

import { useRef, useState } from "react"

interface Props {
  onUpload: (publicUrl: string) => void
}

export default function ImageUpload({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    setUploading(true)
    try {
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
      onUpload(publicUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={
        "flex flex-col items-center justify-center w-full h-28 border border-dashed cursor-pointer " +
        (dragging
          ? "border-dash-accent bg-dash-border"
          : "border-dash-border bg-dash-surface hover:bg-dash-border")
      }
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
      }}
    >
      <span className="font-mono text-xs tracking-widest text-dash-text-mid uppercase">
        {uploading ? "Uploading…" : "Drop image or click to upload"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
