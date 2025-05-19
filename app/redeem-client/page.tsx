"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function RedeemClientPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Initialize user ID
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.Telegram && window.Telegram.WebApp) {
        // @ts-ignore
        const twa = window.Telegram.WebApp

        // Get user ID from Telegram WebApp
        if (twa.initDataUnsafe && twa.initDataUnsafe.user) {
          const telegramUserId = twa.initDataUnsafe.user.id.toString()
          console.log("Telegram user ID:", telegramUserId)
          setUserId(telegramUserId)
          setDebugInfo(`User ID: ${telegramUserId}`)
        } else {
          console.log("No user data in Telegram WebApp")
          setDebugInfo("No user data in Telegram WebApp")
          // For testing purposes, set a default user ID
          if (process.env.NODE_ENV === "development") {
            setUserId("dev-user-123")
            setDebugInfo(`Dev mode - User ID: dev-user-123`)
          }
        }

        twa.ready()
        twa.expand()
      } else {
        console.log("Telegram WebApp not available")
        setDebugInfo("Telegram WebApp not available")
        // For testing purposes, set a default user ID
        if (process.env.NODE_ENV === "development") {
          setUserId("dev-user-123")
          setDebugInfo(`Dev mode - User ID: dev-user-123`)
        }
      }
    } catch (error: any) {
      console.error("Error initializing Telegram Web App:", error)
      setDebugInfo(`Error initializing: ${error.message}`)
      // For testing purposes, set a default user ID
      if (process.env.NODE_ENV === "development") {
        setUserId("dev-user-123")
        setDebugInfo(`Dev mode - User ID: dev-user-123`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
          <div className="flex items-center justify-between">
            <Link href="/generate" className="text-purple-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              Key System Removed
            </CardTitle>
            <div className="w-5"></div>
          </div>
          <CardDescription className="text-center text-purple-300 mt-2">
            The key system has been removed
          </CardDescription>
        </CardHeader>

        {isLoading ? (
          <CardContent className="pt-6 pb-4 bg-gradient-to-b from-gray-900/50 to-black/50">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-purple-400 mb-2 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-white">Initializing...</h3>
              <p className="text-gray-300 mb-4">Please wait while we set up your account.</p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="pt-6 pb-4 space-y-6">
            <Alert className="bg-blue-900/20 border-blue-500/30 text-blue-300">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-blue-300">Information</AlertTitle>
              <AlertDescription className="text-blue-300/80">
                The key system has been removed. All features are now available for free.
              </AlertDescription>
            </Alert>

            {/* Debug Info */}
            {debugInfo && (
              <div className="bg-gray-800 p-3 rounded text-xs text-gray-300 font-mono whitespace-pre-wrap">
                <div className="font-bold mb-1">Debug Info:</div>
                {debugInfo}
              </div>
            )}
          </CardContent>
        )}

        <CardFooter className="bg-black/60 border-t border-purple-900/30 pt-4 flex justify-between">
          <Button variant="outline" className="border-purple-700/50 text-purple-300 hover:bg-purple-900/20" asChild>
            <Link href="/generate">Back to Generator</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
