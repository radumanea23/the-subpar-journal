import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/")

  return (
    <div className="flex min-h-screen bg-dash-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 text-dash-text">
        {children}
      </main>
    </div>
  )
}
