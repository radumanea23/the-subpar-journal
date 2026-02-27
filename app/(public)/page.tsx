import SpinningCube from "@/components/public/SpinningCube"
import BlogFeedFiltered from "@/components/public/BlogFeedFiltered"
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
      {/* Hero: newspaper-style three-column layout */}
      <section className="py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px_1fr] gap-y-10 lg:gap-x-10 items-center">

          {/* Left column — Welcome */}
          <div className="space-y-4 lg:border-r lg:border-rule-light lg:pr-10">
            <p className="font-mono text-xs tracking-widest uppercase text-ink-faint">
              Est. 2026 · San Francisco
            </p>
            <h2
              className="font-display font-black text-ink leading-tight"
              style={{ fontSize: "clamp(1.4rem, 2vw, 1.875rem)" }}
            >
              A Notebook From the Intersection
            </h2>
            <div className="w-6 border-t-2 border-rule" />
            <p className="font-body text-sm text-ink-mid leading-relaxed">
              A personal blog covering AI, data science, software engineering,
              music, sports, and life in San Francisco. Honest observations,
              periodic posts, no pretense.
            </p>
          </div>

          {/* Center — Spinning cube */}
          <div className="flex justify-center">
            <SpinningCube />
          </div>

          {/* Right column — About */}
          <div className="space-y-4 lg:border-l lg:border-rule-light lg:pl-10">
            <p className="font-mono text-xs tracking-widest uppercase text-ink-faint">
              The Author
            </p>
            <h2 className="font-display font-black text-2xl text-ink leading-tight">
              Radu Manea
            </h2>
            <p className="font-mono text-xs tracking-widest uppercase text-ink-mid">
              Data Scientist &amp; Software Engineer
            </p>
            <div className="w-6 border-t-2 border-rule" />
            <p className="font-body text-sm text-ink-mid leading-relaxed">
              Graduated UC San Diego, 2023. Currently based in San Francisco, CA.
              Off the clock: golf, pickleball, producing house music, and hunting
              for the city&apos;s next great restaurant.
            </p>
          </div>

        </div>
      </section>

      <hr className="rule-mid" />

      <section className="py-16">
        <BlogFeedFiltered posts={posts} />
      </section>
    </main>
  )
}
