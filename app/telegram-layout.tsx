"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { nanoid } from "nanoid"

interface TelegramLayoutProps {
  children: React.ReactNode
}

export default function TelegramLayout({ children }: TelegramLayoutProps) {
  const router = useRouter()
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Check if Telegram WebApp is available
      // @ts-ignore
      const isTelegram = !!window.Telegram?.WebApp
      setIsTelegramWebApp(isTelegram)

      // If we're in Telegram, initialize the WebApp
      if (isTelegram) {
        try {
          // @ts-ignore
          const twa = window.Telegram.WebApp

          // Get user ID from Telegram WebApp
          if (twa.initDataUnsafe && twa.initDataUnsafe.user) {
            const telegramUserId = twa.initDataUnsafe.user.id.toString()

            // Store the user ID in session storage for other components to use
            sessionStorage.setItem("telegram_user_id", telegramUserId)

            // Generate a simple auth token using nanoid for consistency
            const simpleToken = `telegram-${telegramUserId}-${nanoid()}`
            sessionStorage.setItem("telegram_auth_token", simpleToken)
          }

          twa.ready()
          twa.expand()
        } catch (error) {
          console.error("Error initializing Telegram Web App:", error)
        }
      }

      setIsLoading(false)
    }
  }, [])

  // Show loading state
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

  // If not in Telegram WebApp, show a message
  if (!isTelegramWebApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="max-w-md text-center bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700/30">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">Telegram App Required</h2>
          <p className="mb-4">
            This application is designed to work inside the Telegram app. Please open this link using the Telegram app.
          </p>
          <div className="bg-gray-900 p-4 rounded text-sm text-gray-300 mb-4">
            <p>If you're already in Telegram, try refreshing the page or opening it again.</p>
          </div>
          <button
            onClick={() => (window.location.href = "https://t.me/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Open Telegram
          </button>
        </div>
      </div>
    )
  }

  // If in Telegram WebApp, render children
  return <>{children}</>
}