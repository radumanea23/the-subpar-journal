"use client"

import dynamic from "next/dynamic"
import type { Post } from "@/types"

// TipTap uses useLayoutEffect and accesses browser globals at init time.
// next/dynamic with ssr:false prevents Next.js from pre-rendering it on the server.
const PostEditorClient = dynamic(
  () => import("@/components/dashboard/PostEditorClient"),
  { ssr: false },
)

export default function PostEditorNoSSR({
  initialPost,
}: {
  initialPost?: Post
}) {
  return <PostEditorClient initialPost={initialPost} />
}
