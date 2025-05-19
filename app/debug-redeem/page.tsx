"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { deepDebugKeyRedeem } from "../actions/debugKeyActions"

export default function DebugRedeemPage() {
  const [keyCode, setKeyCode] = useState("")
  const [userId, setUserId] = useState("")
  const [manualUserId, setManualUserId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>({})
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [telegramInfo, setTelegramInfo] = useState<any>({})

  // Add diagnostic log
  function addLog(message: string) {
    setDebugLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
    console.log(message)
  }

  // Initialize with extensive diagnostics
  useEffect(() => {
    addLog("Page loaded - starting diagnostics")

    // Collect environment info
    const envInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      platform: navigator.platform,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      localStorage: typeof window.localStorage !== "undefined",
      sessionStorage: typeof window.sessionStorage !== "undefined",
    }

    // Check for Telegram WebApp
    const telegramData: any = {
      available: false,
      initialized: false,
      userData: null,
      initData: null,
      initDataRaw: null,
      colorScheme: null,
    }

    try {
      // @ts-ignore - Telegram object is injected by the Telegram WebApp
      if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
        telegramData.available = true
        addLog("Telegram WebApp is available")

        // @ts-ignore
        const twa = window.Telegram.WebApp

        try {
          // Try to initialize
          twa.expand()
          twa.ready()
          telegramData.initialized = true
          addLog("Telegram WebApp initialized")
        } catch (initError) {
          addLog(`Failed to initialize Telegram WebApp: ${initError}`)
          telegramData.initError = String(initError)
        }

        // Try to get user data
        if (twa.initDataUnsafe && twa.initDataUnsafe.user) {
          telegramData.userData = twa.initDataUnsafe.user
          const userId = twa.initDataUnsafe.user.id.toString()
          setUserId(userId)
          addLog(`Got user ID from Telegram: ${userId}`)
        } else {
          addLog("No user data in Telegram initDataUnsafe")
        }

        // Log raw initData for debugging
        if (twa.initData) {
          telegramData.initDataRaw = twa.initData
          addLog("Raw initData available")

          try {
            const parsedData = JSON.parse(twa.initData)
            telegramData.initData = parsedData
            addLog("Successfully parsed initData")
          } catch (parseError) {
            addLog(`Failed to parse initData: ${parseError}`)

            try {
              // Try parsing as URL params
              const params = new URLSearchParams(twa.initData)
              const parsedParams: any = {}

              params.forEach((value, key) => {
                parsedParams[key] = value
                if (key === "user") {
                  try {
                    parsedParams.user = JSON.parse(decodeURIComponent(value))
                    if (parsedParams.user.id) {
                      const userId = parsedParams.user.id.toString()
                      setUserId(userId)
                      addLog(`Got user ID from parsed params: ${userId}`)
                    }
                  } catch (e) {
                    addLog(`Failed to parse user param: ${e}`)
                  }
                }
              })

              telegramData.initData = parsedParams
              addLog("Parsed initData as URL params")
            } catch (e) {
              addLog(`Failed to parse initData as URL params: ${e}`)
            }
          }
        } else {
          addLog("No raw initData available from Telegram")
        }

        // Get theme info
        if (twa.colorScheme) {
          telegramData.colorScheme = twa.colorScheme
          addLog(`Telegram color scheme: ${twa.colorScheme}`)
        }
      } else {
        addLog("Telegram WebApp is NOT available")
      }
    } catch (e) {
      addLog(`Error checking Telegram WebApp: ${e}`)
      telegramData.error = String(e)
    }

    // Try to get user ID from URL
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const urlUserId = urlParams.get("userId")
      if (urlUserId) {
        addLog(`Found user ID in URL parameters: ${urlUserId}`)
        if (!userId) {
          setUserId(urlUserId)
          addLog(`Using URL user ID: ${urlUserId}`)
        }
      } else {
        addLog("No user ID in URL parameters")
      }
    } catch (e) {
      addLog(`Error getting URL parameters: ${e}`)
    }

    // Try to get user ID from localStorage
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const storedUserId = localStorage.getItem("telegram_user_id")
        if (storedUserId) {
          addLog(`Found stored user ID in localStorage: ${storedUserId}`)
          if (!userId) {
            setUserId(storedUserId)
            addLog(`Using stored user ID: ${storedUserId}`)
          }
        } else {
          addLog("No user ID in localStorage")
        }
      }
    } catch (e) {
      addLog(`Error accessing localStorage: ${e}`)
    }

    setDiagnosticInfo({
      env: envInfo,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : null,
    })

    setTelegramInfo(telegramData)
  }, [])

  // Handle form submission with detailed diagnostics
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    addLog("Starting key redemption process")

    // Use manual user ID if provided
    const userIdToUse = manualUserId.trim() || userId

    if (!userIdToUse) {
      addLog("ERROR: No user ID available for redemption")
      setIsSubmitting(false)
      return
    }

    if (!keyCode.trim()) {
      addLog("ERROR: No key code provided")
      setIsSubmitting(false)
      return
    }

    addLog(`Attempting to redeem key "${keyCode.trim()}" for user ID "${userIdToUse}"`)

    try {
      // Save user ID to localStorage for future use
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("telegram_user_id", userIdToUse)
        addLog(`Saved user ID to localStorage: ${userIdToUse}`)
      }

      // Call server action with all diagnostic data
      const result = await deepDebugKeyRedeem(userIdToUse, keyCode.trim(), {
        telegramInfo,
        diagnosticInfo,
        clientLogs: debugLogs,
      })

      // Add server logs to client logs
      if (result.logs && Array.isArray(result.logs)) {
        result.logs.forEach((log: string) => {
          addLog(`[SERVER] ${log}`)
        })
      }

      // Update state with results
      setDiagnosticInfo((prev) => ({
        ...prev,
        serverResponse: result,
      }))

      if (result.success) {
        addLog(`SUCCESS: Key redeemed! Credits added: ${result.creditsAdded}`)
      } else {
        addLog(`FAILED: ${result.message}`)
      }
    } catch (error) {
      addLog(`CRITICAL ERROR during redemption: ${error}`)
      setDiagnosticInfo((prev) => ({
        ...prev,
        error: String(error),
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Debug Key Redemption</h1>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="font-medium">This is a special debugging page to help fix key redemption issues.</p>
        <p>It provides detailed diagnostics about what's happening during the redemption process.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Redeem a Key</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="keyCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Key Code
                </label>
                <input
                  id="keyCode"
                  type="text"
                  value={keyCode}
                  onChange={(e) => setKeyCode(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your key code"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  Detected User ID: {userId || "None"}
                </label>
                <input
                  id="manualUserId"
                  type="text"
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Override with a manual user ID (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use the automatically detected ID, or enter a different ID to override.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSubmitting ? "Processing..." : "Redeem Key with Full Diagnostics"}
              </button>
            </form>

            <div className="mt-4">
              <p className="text-sm font-medium">Current user ID: {userId || manualUserId || "Unknown"}</p>
              <p className="text-sm">Telegram WebApp available: {telegramInfo.available ? "Yes" : "No"}</p>
              <p className="text-sm">Telegram initialized: {telegramInfo.initialized ? "Yes" : "No"}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Telegram Status</h2>
            {telegramInfo.userData ? (
              <div>
                <p>
                  <strong>User ID:</strong> {telegramInfo.userData.id}
                </p>
                <p>
                  <strong>Username:</strong> {telegramInfo.userData.username || "N/A"}
                </p>
                <p>
                  <strong>First Name:</strong> {telegramInfo.userData.first_name || "N/A"}
                </p>
                <p>
                  <strong>Last Name:</strong> {telegramInfo.userData.last_name || "N/A"}
                </p>
                <p>
                  <strong>Language:</strong> {telegramInfo.userData.language_code || "N/A"}
                </p>
              </div>
            ) : (
              <p className="text-red-500">No Telegram user data available</p>
            )}

            <h3 className="text-md font-semibold mt-4 mb-2">Raw Data</h3>
            <div className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(telegramInfo, null, 2)}</pre>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-3">Debug Logs</h2>
            <div className="bg-black text-green-400 p-2 rounded font-mono text-xs h-96 overflow-y-auto">
              {debugLogs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))}
              {isSubmitting && <div className="animate-pulse">Processing...</div>}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">Diagnostic Information</h2>
            <div className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(diagnosticInfo, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a
          href="https://t.me/fansignpreviews"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Check out our Telegram preview channel
        </a>
      </div>
    </div>
  )
}
