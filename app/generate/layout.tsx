import type React from "react"

// Remove AuthGuard - allow anyone to access the generate page
export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}