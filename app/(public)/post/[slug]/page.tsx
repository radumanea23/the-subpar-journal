import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import type { Post } from "@/types"
import { formatDate, readingTime } from "@/lib/utils"

interface Props {
  params: { slug: string }
}

// Phase 2: replace with real Firestore fetch
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getPostBySlug(_slug: string): Promise<Post | null> {
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} — The Subpar Journal`,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <main className="max-w-prose mx-auto px-4 sm:px-6 py-16">
      {/* Back link */}
      <Link
        href="/"
        className="font-mono text-xs tracking-widest text-ink-faint uppercase hover:underline"
      >
        ← The Journal
      </Link>

      <hr className="rule-light mt-6 mb-8" />

      {/* Post header */}
      <header className="mb-10">
        <p className="font-mono text-xs tracking-widest uppercase mb-3"
          style={{ color: `var(--color-accent-${post.category})` }}>
          {post.category}
        </p>
        <h1 className="font-display text-4xl font-black text-ink leading-tight text-balance mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 font-mono text-xs text-ink-faint">
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          <span>{readingTime(post.content)} min read</span>
        </div>
      </header>

      <hr className="rule-light mb-10" />

      {/* Post body — Phase 2: render TipTap JSON as HTML */}
      <article className="prose-editorial">
        <p className="text-ink-mid">{post.excerpt}</p>
      </article>
    </main>
  )
}
