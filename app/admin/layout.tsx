import type React from "react"
import { PreviewIndicator } from "@/components/preview-indicator"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PreviewIndicator />
      {children}
    </>
  )
}
