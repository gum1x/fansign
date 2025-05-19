"use client"

import type React from "react"

import { useState } from "react"
import { useSessionContext } from "./session-provider"
import { KEY_LIMITS, type KeyPlan } from "@/lib/auth"

export function DashboardClient() {
  const {
    isLoading,
    isAuthenticated,
    apiKey,
    plan,
    expiresAt,
    remainingDaily,
    remainingMonthly,
    error,
    login,
    logout,
  } = useSessionContext()

  const [inputKey, setInputKey] = useState("")
  const [showKey, setShowKey] = useState(false)

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Calculate days until expiration
  const getDaysUntilExpiration = (dateString: string | null) => {
    if (!dateString) return 0

    const expirationDate = new Date(dateString)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  // Handle login form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputKey.trim()) {
      login(inputKey.trim())
    }
  }

  // Get plan features
  const getPlanFeatures = (planType: KeyPlan | null) => {
    if (!planType) return []
    return KEY_LIMITS[planType].features
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Enter API Key</h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your API key"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Don't have an API key? Contact support to get one.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">API Key Dashboard</h2>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">
              Logout
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Your API Key</h3>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-100 p-3 rounded font-mono text-sm overflow-x-auto">
                {showKey ? apiKey : "•".repeat(apiKey?.length || 20)}
              </div>
              <button onClick={() => setShowKey(!showKey)} className="ml-2 text-blue-600 hover:text-blue-800 text-sm">
                {showKey ? "Hide" : "Show"}
              </button>
              <button
                onClick={() => {
                  if (apiKey) {
                    navigator.clipboard.writeText(apiKey)
                    alert("API key copied to clipboard!")
                  }
                }}
                className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Plan Details</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="mb-2">
                  <span className="font-medium">Plan Type:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full 
                    ${
                      plan === "free"
                        ? "bg-gray-200 text-gray-800"
                        : plan === "basic"
                          ? "bg-blue-100 text-blue-800"
                          : plan === "premium"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                    }`}
                  >
                    {plan || "Unknown"}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Expires On:</span> <span>{formatDate(expiresAt)}</span>
                  {expiresAt && getDaysUntilExpiration(expiresAt) <= 7 && (
                    <span className="ml-2 text-red-500 text-sm">
                      (Expires in {getDaysUntilExpiration(expiresAt)} days)
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-medium">Features:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {getPlanFeatures(plan).map((feature) => (
                      <span key={feature} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {feature.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Usage Limits</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Daily Usage:</span>
                    <span>{remainingDaily === -1 ? "Unlimited" : `${remainingDaily} remaining`}</span>
                  </div>
                  {remainingDaily !== -1 && remainingDaily !== null && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          remainingDaily <= 0 ? "bg-red-500" : remainingDaily < 5 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{
                          width: `${
                            remainingDaily <= 0
                              ? 100
                              : Math.min(
                                  100,
                                  100 - (remainingDaily / (KEY_LIMITS[plan as KeyPlan]?.dailyLimit || 1)) * 100,
                                )
                          }%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Monthly Usage:</span>
                    <span>{remainingMonthly === -1 ? "Unlimited" : `${remainingMonthly} remaining`}</span>
                  </div>
                  {remainingMonthly !== -1 && remainingMonthly !== null && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          remainingMonthly <= 0
                            ? "bg-red-500"
                            : remainingMonthly < 50
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${
                            remainingMonthly <= 0
                              ? 100
                              : Math.min(
                                  100,
                                  100 - (remainingMonthly / (KEY_LIMITS[plan as KeyPlan]?.monthlyLimit || 1)) * 100,
                                )
                          }%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="mb-4">
                Use your API key to authenticate requests to our API endpoints. Include your key in the request header
                or as a query parameter.
              </p>

              <div className="mb-4">
                <h4 className="font-medium mb-1">Example Request (Header Authentication)</h4>
                <pre className="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
                  {`fetch('https://api.example.com/search?q=query', {
  headers: {
    'Authorization': 'Bearer ${apiKey?.substring(0, 3)}...${apiKey?.substring(apiKey.length - 4)}'
  }
})`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-1">Example Request (Query Parameter)</h4>
                <pre className="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
                  {`fetch('https://api.example.com/search?q=query&key=${apiKey?.substring(0, 3)}...${apiKey?.substring(apiKey.length - 4)}')`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
