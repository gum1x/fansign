import type React from "react"
import TelegramLayout from "../telegram-layout"

export default function RedeemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TelegramLayout>{children}</TelegramLayout>
}
