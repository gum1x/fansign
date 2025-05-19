"use client"

import type React from "react"
import { useState, useEffect } from "react"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [telegramWebApp, setTelegramWebApp] = useState<any>(null)

  // Initialize Telegram Web App
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.Telegram && window.Telegram.WebApp) {
        // @ts-ignore
        const twa = window.Telegram.WebApp
        setTelegramWebApp(twa)
        twa.ready()
        twa.expand()
      }
    } catch (error) {
      console.error("Error initializing Telegram Web App:", error)
    }
  }, [])

  return (
    <>
      {/* Original content (now visible) */}
      {children}
    </>
  )
}
