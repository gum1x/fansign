"use client"

import { useState, useEffect } from "react"
import { getUserIdFromTelegram, initTelegramWebApp, isTelegramWebApp } from "@/utils/telegramHelper"

export default function DebugTelegramPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isTelegram, setIsTelegram] = useState<boolean>(false)
  const [initData, setInitData] = useState<string>("")
  const [initialized, setInitialized] = useState<boolean>(false)

  useEffect(() => {
    // Check if we're in the Telegram WebApp
    const inTelegram = isTelegramWebApp()
    setIsTelegram(inTelegram)

    // Try to initialize the Telegram WebApp
    if (inTelegram) {
      const init = initTelegramWebApp()
      setInitialized(init)
    }

    // Try to get the user ID
    const telegramUserId = getUserIdFromTelegram()
    setUserId(telegramUserId)

    // Try to get the initData
    try {
      // @ts-ignore - Telegram object is injected by the Telegram WebApp
      if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
        // @ts-ignore
        const twa = window.Telegram.WebApp
        if (twa.initData) {
          setInitData(twa.initData)
        }
      }
    } catch (error) {
      console.error("Error getting initData:", error)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Telegram Debug Info</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Telegram WebApp Status</h2>
          <p>
            <strong>In Telegram WebApp:</strong> {isTelegram ? "Yes" : "No"}
          </p>
          <p>
            <strong>WebApp Initialized:</strong> {initialized ? "Yes" : "No"}
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">User Information</h2>
          <p>
            <strong>User ID:</strong> {userId || "Not found"}
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">InitData</h2>
          <textarea readOnly value={initData} className="w-full h-32 p-2 border rounded text-xs font-mono" />
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">URL Parameters</h2>
          <p>
            <strong>userId:</strong>{" "}
            {typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("userId") || "Not found"
              : "Not available"}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Troubleshooting</h2>
          <p className="mb-2">If your User ID is not showing, try these steps:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Make sure you're opening this page from the Telegram app</li>
            <li>Try refreshing the page</li>
            <li>Check if you have the latest version of Telegram</li>
            <li>
              If using a test URL, add <code className="bg-gray-100 px-1">?userId=YOUR_ID</code> to the URL
            </li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://t.me/fansignpreviews"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Check out our preview channel
          </a>
        </div>
      </div>
    </div>
  )
}
