import Link from "next/link"
import type { Post } from "@/types"
import { formatDate } from "@/lib/utils"
import CategoryBadge from "./CategoryBadge"

interface Props {
  post: Post
}

export default function PostCard({ post }: Props) {
  return (
    <Link href={`/post/${post.slug}`} className="group block">
      <article className="bg-parchment-dark border border-rule-light p-6 h-full transition-colors duration-150 group-hover:bg-parchment">
        <CategoryBadge category={post.category} />

        <h2 className="font-display font-bold text-xl text-ink mt-3 mb-3 leading-tight group-hover:underline underline-offset-2">
          {post.title}
        </h2>

        <p className="font-body text-sm text-ink-mid leading-relaxed line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        <hr className="border-rule-light mb-4" />

        <p className="font-mono text-xs text-ink-faint">
          {post.publishedAt ? formatDate(post.publishedAt) : "DRAFT"}
        </p>
      </article>
    </Link>
  )
}
