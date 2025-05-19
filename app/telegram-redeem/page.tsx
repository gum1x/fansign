"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserIdFromTelegram, initTelegramWebApp } from "@/utils/telegramHelper"
import { redeemKeySimple } from "../actions/telegramKeyActions"

export default function TelegramRedeemPage() {
  const [keyCode, setKeyCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [telegramInitialized, setTelegramInitialized] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    creditsAdded?: number
    totalCredits?: number
  } | null>(null)
  const router = useRouter()

  // Initialize Telegram and get user ID on component mount
  useEffect(() => {
    // Initialize Telegram WebApp
    const initialized = initTelegramWebApp()
    setTelegramInitialized(initialized)

    // Try to get user ID with multiple approaches
    const fetchUserId = async () => {
      // First try: Get from Telegram WebApp
      let id = getUserIdFromTelegram()

      // Second try: Get from URL parameter
      if (!id && typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search)
        id = urlParams.get("userId")
      }

      // Third try: Get from localStorage (if previously saved)
      if (!id && typeof window !== "undefined" && window.localStorage) {
        id = localStorage.getItem("telegram_user_id")
      }

      // If we have an ID, save it and set state
      if (id) {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("telegram_user_id", id)
        }
        setUserId(id)
        console.log("User ID set:", id)
      } else {
        console.log("Could not determine user ID")
      }
    }

    fetchUserId()

    // Check URL for direct key redemption
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const keyFromUrl = urlParams.get("key")
      if (keyFromUrl) {
        setKeyCode(keyFromUrl)
        // Auto-submit if we also have a userId
        if (userId) {
          handleRedeemKey(null, keyFromUrl)
        }
      }
    }
  }, [])

  // Handle key redemption
  async function handleRedeemKey(e: React.FormEvent | null, directKey?: string) {
    if (e) e.preventDefault()

    const keyToRedeem = directKey || keyCode.trim()

    if (!keyToRedeem) {
      setResult({
        success: false,
        message: "Please enter a key code",
      })
      return
    }

    // Get user ID with fallbacks
    let currentUserId = userId

    // Try to get from Telegram again
    if (!currentUserId) {
      currentUserId = getUserIdFromTelegram()
    }

    // Try URL parameter
    if (!currentUserId && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      currentUserId = urlParams.get("userId")
    }

    // Final fallback: prompt user
    if (!currentUserId) {
      const promptedId = prompt("Please enter your Telegram User ID:")
      if (promptedId) {
        currentUserId = promptedId
        // Save for future use
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("telegram_user_id", currentUserId)
        }
        setUserId(currentUserId)
      }
    }

    if (!currentUserId) {
      setResult({
        success: false,
        message: "Unable to identify your Telegram account. Please try again or contact support.",
      })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      console.log(`Attempting to redeem key ${keyToRedeem} for user ${currentUserId}`)
      const response = await redeemKeySimple(currentUserId, keyToRedeem)
      console.log("Redemption response:", response)

      setResult({
        success: response.success,
        message: response.message,
        creditsAdded: response.creditsAdded,
        totalCredits: response.newCredits,
      })

      if (response.success) {
        // Clear the input field
        setKeyCode("")
      }
    } catch (error) {
      console.error("Error redeeming key:", error)
      setResult({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Redeem Key</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {!userId && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded">
            <p>
              Unable to automatically detect your Telegram account. Please make sure you're opening this page from the
              Telegram app.
            </p>
          </div>
        )}

        <form onSubmit={handleRedeemKey}>
          <div className="mb-4">
            <label htmlFor="keyCode" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your key code
            </label>
            <input
              type="text"
              id="keyCode"
              value={keyCode}
              onChange={(e) => setKeyCode(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="XXX-XXXX-XXXX-XXXX"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Redeeming..." : "Redeem Key"}
          </button>
        </form>

        {result && (
          <div
            className={`mt-4 p-3 rounded ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
          >
            <p>{result.message}</p>
            {result.success && result.creditsAdded && (
              <p className="mt-2">
                <strong>{result.creditsAdded}</strong> credits added to your account.
                <br />
                You now have <strong>{result.totalCredits}</strong> total credits.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <button onClick={() => router.push("/generate")} className="text-blue-600 hover:text-blue-800">
            Back to Generator
          </button>
        </div>

        <div className="mt-4 text-center">
          <a
            href="https://t.me/fansignpreviews"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Check out our preview channel
          </a>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>User ID: {userId || "Unknown"}</p>
          <p>Telegram initialized: {telegramInitialized ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  )
}
