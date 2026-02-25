import SpinningCube from "@/components/public/SpinningCube"
import BlogFeed from "@/components/public/BlogFeed"
import { getDb } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"
import type { Post, Category } from "@/types"

function toDate(v: unknown): Date | undefined {
  if (v instanceof Timestamp) return v.toDate()
  if (v instanceof Date) return v
  return undefined
}

async function getPosts(): Promise<Post[]> {
  try {
    const snap = await getDb()
      .collection("posts")
      .where("published", "==", true)
      .orderBy("publishedAt", "desc")
      .get()

    return snap.docs.map((doc) => {
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
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const posts = await getPosts()

  return (
    <main className="max-w-site mx-auto px-4 sm:px-6 lg:px-8">
      <section className="flex flex-col items-center py-24">
        <SpinningCube />
      </section>

      <hr className="rule-mid" />

      <section className="py-16">
        <BlogFeed posts={posts} />
      </section>
    </main>
  )
}
