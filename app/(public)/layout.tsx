import Masthead from "@/components/public/Masthead"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Masthead />
      {children}
    </>
  )
}
