import type React from "react"
import TelegramLayout from "../telegram-layout"

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TelegramLayout>{children}</TelegramLayout>
}
