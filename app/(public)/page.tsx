import SpinningCube from "@/components/public/SpinningCube"
import BlogFeed from "@/components/public/BlogFeed"
import type { Post } from "@/types"

// Phase 2: replace with real Firestore fetch via firebase-admin
async function getPosts(): Promise<Post[]> {
  return []
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
