import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getDb } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"
import type { Post, Category } from "@/types"
import { formatDate, readingTime } from "@/lib/utils"

interface Props {
  params: { slug: string }
}

function toDate(v: unknown): Date | undefined {
  if (v instanceof Timestamp) return v.toDate()
  if (v instanceof Date) return v
  return undefined
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const snap = await getDb()
      .collection("posts")
      .where("slug", "==", slug)
      .where("published", "==", true)
      .limit(1)
      .get()

    if (snap.empty) return null
    const doc = snap.docs[0]
    const d = doc.data()
    return {
      id: doc.id,
      slug: d.slug as string,
      title: d.title as string,
      excerpt: d.excerpt as string,
      content: (d.content as string) ?? "",
      category: d.category as Category,
      coverImage: d.coverImage as string | undefined,
      published: true,
      publishedAt: toDate(d.publishedAt),
      createdAt: toDate(d.createdAt) ?? new Date(),
      updatedAt: toDate(d.updatedAt) ?? new Date(),
    }
  } catch {
    return null
  }
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

      <hr className="rule-mid mt-6 mb-8" />

      {/* Post header */}
      <header className="mb-10">
        <p
          className="font-mono text-xs tracking-widest uppercase mb-3"
          style={{ color: `var(--color-accent-${post.category})` }}
        >
          {post.category}
        </p>
        <h1 className="font-display text-4xl font-black text-ink leading-tight text-balance mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 font-mono text-xs text-ink-faint">
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          <span>{readingTime(post.content || post.excerpt)} min read</span>
        </div>
      </header>

      <hr className="rule-mid mb-10" />

      {/* Post body — full TipTap rendering in Phase 4 */}
      <article className="prose-editorial">
        {post.content ? (
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p className="text-ink-mid">{post.excerpt}</p>
        )}
      </article>
    </main>
  )
}
