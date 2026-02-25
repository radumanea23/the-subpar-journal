"use client"

// Phase 4: Implement drag-drop + paste upload via /api/upload signed URL flow.

interface Props {
  onUpload: (publicUrl: string) => void
}

export default function ImageUpload({ onUpload }: Props) {
  async function handleFile(file: File) {
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
  }

  return (
    <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-dash-border bg-dash-surface cursor-pointer hover:bg-dash-border transition-colors duration-150">
      <span className="font-mono text-xs tracking-widest text-dash-text-mid uppercase">
        Drop image or click to upload
      </span>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </label>
  )
}
