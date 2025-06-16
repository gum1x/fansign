import type React from "react"
import AuthGuard from "../components/auth/AuthGuard"

export default function PurchaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard>{children}</AuthGuard>
}