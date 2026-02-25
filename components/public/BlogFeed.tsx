import type { Post } from "@/types"
import PostCard from "./PostCard"

interface Props {
  posts: Post[]
}

export default function BlogFeed({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center py-20">
        <hr className="rule-light w-16 mb-8" />
        <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
          No entries yet
        </p>
        <hr className="rule-light w-16 mt-8" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
