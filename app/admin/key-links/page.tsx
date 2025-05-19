"use client"

import { useState } from "react"
import { generateKeys } from "@/app/actions/keyActions"
import { getUserIdFromTelegram } from "@/utils/telegramHelper"
import { isAdmin } from "@/utils/adminUtils"

export default function KeyLinksPage() {
  const [keyType, setKeyType] = useState("STANDARD")
  const [count, setCount] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([])
  const [baseUrl, setBaseUrl] = useState("")
  const [isAdminUser, setIsAdminUser] = useState(false)

  // Check if user is admin on component mount
  useState(() => {
    const checkAdmin = async () => {
      const userId = getUserIdFromTelegram()
      if (userId) {
        const adminStatus = await isAdmin(userId)
        setIsAdminUser(adminStatus)
      }
    }

    checkAdmin()

    // Set base URL
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      setBaseUrl(`${url.protocol}//${url.host}`)
    }
  })

  // Generate keys
  async function handleGenerateKeys() {
    setIsGenerating(true)

    try {
      const userId = getUserIdFromTelegram() || "admin"
      const result = await generateKeys(keyType, count, userId)

      if (result.success && result.keys) {
        setGeneratedKeys(result.keys)
      } else {
        alert("Failed to generate keys: " + result.message)
      }
    } catch (error) {
      console.error("Error generating keys:", error)
      alert("An unexpected error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  // Copy link to clipboard
  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Link copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
        alert("Failed to copy link")
      })
  }

  if (!isAdminUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg shadow-md text-red-800">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Generate Key Links</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="keyType" className="block text-sm font-medium text-gray-700 mb-1">
              Key Type
            </label>
            <select
              id="keyType"
              value={keyType}
              onChange={(e) => setKeyType(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="BASIC">Basic (10 credits)</option>
              <option value="STANDARD">Standard (25 credits)</option>
              <option value="PREMIUM">Premium (50 credits)</option>
              <option value="UNLIMITED">Unlimited (100 credits)</option>
            </select>
          </div>

          <div>
            <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Keys
            </label>
            <input
              type="number"
              id="count"
              value={count}
              onChange={(e) => setCount(Number.parseInt(e.target.value) || 1)}
              min="1"
              max="50"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateKeys}
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300"
        >
          {isGenerating ? "Generating..." : "Generate Key Links"}
        </button>
      </div>

      {generatedKeys.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Generated Key Links</h2>

          <div className="space-y-4">
            {generatedKeys.map((key, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm">{key}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{keyType}</span>
                </div>

                <div className="text-sm mb-2 font-mono overflow-x-auto">{`${baseUrl}/redeem-key/${key}`}</div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(`${baseUrl}/redeem-key/${key}`)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                  >
                    Copy Link
                  </button>

                  <a
                    href={`${baseUrl}/redeem-key/${key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded"
                  >
                    Open Link
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(`${baseUrl}/redeem-key/${key}`)}&text=${encodeURIComponent("Here's your key to redeem credits!")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-green-200 hover:bg-green-300 px-2 py-1 rounded"
                  >
                    Share on Telegram
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
  )
}
