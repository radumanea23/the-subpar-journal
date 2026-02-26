import { notFound } from "next/navigation"
import { getDb } from "@/lib/firebase-admin"
import PostEditorNoSSR from "@/components/dashboard/PostEditorNoSSR"
import type { Post } from "@/types"

interface Props {
  params: { id: string }
}

export default async function EditPostPage({ params }: Props) {
  const doc = await getDb().collection("posts").doc(params.id).get()
  if (!doc.exists) notFound()

  const data = doc.data()!
  const post: Post = {
    id: doc.id,
    slug: data.slug ?? "",
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
    content: data.content ?? "",
    category: data.category ?? "ai",
    coverImage: data.coverImage ?? undefined,
    published: data.published ?? false,
    publishedAt: data.publishedAt?.toDate?.() ?? undefined,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }

  return <PostEditorNoSSR initialPost={post} />
}
