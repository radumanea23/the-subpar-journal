export type Category = "ai" | "music" | "sports" | "stocks" | "life"
export type ProjectStatus = "backlog" | "active" | "done"
export type Priority = "low" | "medium" | "high"

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: Category
  coverImage?: string
  published: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CheckIn {
  id: string // "YYYY-MM-DD"
  date: Date
  workout: boolean
  weight?: number
  goals: CheckInGoal[]
  note?: string
  createdAt: Date
  updatedAt: Date
}

export interface CheckInGoal {
  id: string
  label: string
  completed: boolean
}

export interface Goal {
  id: string
  label: string
  active: boolean
  order: number
}

export interface Project {
  id: string
  title: string
  description?: string
  status: ProjectStatus
  priority: Priority
  tags: string[]
  tasks: ProjectTask[]
  createdAt: Date
  updatedAt: Date
}

export interface ProjectTask {
  id: string
  label: string
  done: boolean
}
