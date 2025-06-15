"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface TelegramLayoutProps {
  children: React.ReactNode
}

export default function TelegramLayout({ children }: TelegramLayoutProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simple initialization without complex Telegram checks for preview
    setIsLoading(false)
  }, [])

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-gray-400">Initializing application</p>
        </div>
      </div>
    )
  }

  // Render children directly for preview
  return <>{children}</>
}