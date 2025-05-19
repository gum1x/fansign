"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { redeemKey } from "../actions/keyActions"
import { getUserIdFromTelegram } from "@/utils/telegramHelper"

export default function RedeemPage() {
  const [keyCode, setKeyCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    creditsAdded?: number
    totalCredits?: number
  } | null>(null)
  const router = useRouter()

  // Get user ID from Telegram on component mount
  useEffect(() => {
    const telegramUserId = getUserIdFromTelegram()
    if (telegramUserId) {
      setUserId(telegramUserId)
    }
  }, [])

  // Handle key redemption
  async function handleRedeemKey(e: React.FormEvent) {
    e.preventDefault()

    if (!keyCode.trim()) {
      setResult({
        success: false,
        message: "Please enter a key code",
      })
      return
    }

    // Check if we have a user ID from Telegram
    const currentUserId = userId || getUserIdFromTelegram()

    if (!currentUserId) {
      setResult({
        success: false,
        message: "Unable to identify your Telegram account. Please ensure you're using the Telegram Web App.",
      })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await redeemKey(currentUserId, keyCode.trim())

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
              Connecting to Telegram... If this message persists, please ensure you're opening this page from the
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
      </div>
    </div>
  )
}
