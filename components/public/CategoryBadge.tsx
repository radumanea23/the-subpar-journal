import type { Category } from "@/types"

const categoryLabels: Record<Category, string> = {
  ai: "AI",
  music: "Music",
  sports: "Sports",
  stocks: "Stocks",
  life: "Life",
}

const categoryVars: Record<Category, string> = {
  ai: "var(--color-accent-ai)",
  music: "var(--color-accent-music)",
  sports: "var(--color-accent-sports)",
  stocks: "var(--color-accent-stocks)",
  life: "var(--color-accent-life)",
}

interface Props {
  category: Category
}

export default function CategoryBadge({ category }: Props) {
  return (
    <span
      className="font-mono text-xs tracking-widest uppercase"
      style={{ color: categoryVars[category] }}
    >
      {categoryLabels[category]}
    </span>
  )
}
