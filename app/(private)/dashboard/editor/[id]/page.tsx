interface Props {
  params: { id: string }
}

export default function EditPostPage({ params }: Props) {
  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-dash-text-mid uppercase mb-2">
        Blog Editor
      </p>
      <h1 className="font-display text-3xl font-bold text-dash-text mb-8">
        Edit Post
      </h1>
      <hr className="border-dash-border mb-8" />
      {/* Phase 4: load post {params.id} and render <Editor /> */}
      <p className="font-mono text-sm text-dash-text-mid">
        Editing post: {params.id}
      </p>
    </div>
  )
}
