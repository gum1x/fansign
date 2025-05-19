"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getUserIdFromTelegram } from "@/utils/telegramHelper"
import { redeemKeySimple } from "../../actions/telegramKeyActions"

export default function DirectRedeemPage() {
  const router = useRouter()
  const params = useParams()
  const [userId, setUserId] = useState<string | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    creditsAdded?: number
    totalCredits?: number
  } | null>(null)

  useEffect(() => {
    // Get user ID with multiple approaches
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

        // Auto-redeem the key if we have a user ID
        if (params.key) {
          redeemKey(id, params.key as string)
        }
      }
    }

    fetchUserId()
  }, [params.key])

  // Function to redeem the key
  async function redeemKey(currentUserId: string, keyCode: string) {
    if (!currentUserId || !keyCode) {
      setResult({
        success: false,
        message: "Missing user ID or key code",
      })
      return
    }

    setIsRedeeming(true)
    setResult(null)

    try {
      const response = await redeemKeySimple(currentUserId, keyCode)

      setResult({
        success: response.success,
        message: response.message,
        creditsAdded: response.creditsAdded,
        totalCredits: response.newCredits,
      })
    } catch (error) {
      console.error("Error redeeming key:", error)
      setResult({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  // Function to handle manual user ID input
  function handleManualIdSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inputElement = document.getElementById("userId") as HTMLInputElement
    const manualId = inputElement.value.trim()

    if (manualId) {
      setUserId(manualId)
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("telegram_user_id", manualId)
      }

      // Redeem the key with the manual ID
      if (params.key) {
        redeemKey(manualId, params.key as string)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Key Redemption</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {!userId ? (
          <div>
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded">
              <p>Unable to automatically detect your Telegram account. Please enter your Telegram User ID manually.</p>
            </div>

            <form onSubmit={handleManualIdSubmit}>
              <div className="mb-4">
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Telegram User ID
                </label>
                <input
                  type="text"
                  id="userId"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your Telegram User ID"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Continue
              </button>
            </form>
          </div>
        ) : (
          <div>
            {isRedeeming ? (
              <div className="text-center py-4">
                <p className="mb-2">Redeeming your key...</p>
                <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : result ? (
              <div>
                <div
                  className={`p-3 rounded ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
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

                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={() => router.push("/generate")}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    Go to Generator
                  </button>

                  <button
                    onClick={() => router.push("/telegram-redeem")}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    Redeem Another Key
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="mb-2">Preparing to redeem key: {params.key}</p>
                <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
              </div>
            )}
          </div>
        )}

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
