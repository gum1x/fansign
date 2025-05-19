"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, ExternalLink, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { setupCreditSystem } from "@/app/actions/adminActions"

export default function SetupCreditsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  // Check if we're in a preview environment
  useEffect(() => {
    const checkPreviewMode = () => {
      // Check for Vercel preview environment
      const isVercelPreview =
        process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || window.location.hostname.includes("vercel.app")

      setIsPreview(isVercelPreview)

      if (isVercelPreview) {
        console.log("Running in Vercel Preview environment")
        addLog("Running in Vercel Preview environment - special handling enabled")
      }
    }

    checkPreviewMode()
  }, [])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  const handleSetupCredits = async () => {
    try {
      setIsLoading(true)
      setResult(null)
      setLogs([])

      addLog("Starting credit system setup...")

      if (isPreview) {
        addLog("Preview mode detected - using preview-specific setup")
      }

      // Use the server action
      addLog("Calling setupCreditSystem server action")
      const response = await setupCreditSystem(isPreview)
      addLog(`Server action returned: ${JSON.stringify(response)}`)

      setResult({
        success: response.success,
        message:
          response.message ||
          (response.success ? "Credit system set up successfully!" : "Failed to set up credit system"),
      })

      if (response.logs) {
        response.logs.forEach((log: string) => addLog(log))
      }
    } catch (error) {
      console.error("Error setting up credit system:", error)
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setResult({
        success: false,
        message: `Error setting up credit system: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsLoading(false)
      addLog("Setup process completed")
    }
  }

  const handleBackClick = () => {
    router.push("/admin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={handleBackClick} className="text-purple-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              Setup Credit System {isPreview && "(Preview Mode)"}
            </CardTitle>
            <div className="w-5"></div> {/* Empty div for alignment */}
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-4">
          {isPreview && (
            <div className="mb-6 p-3 bg-amber-900/20 border border-amber-700/30 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-amber-400 font-medium">Preview Environment Detected</h3>
                  <p className="text-amber-300/80 text-sm mt-1">
                    Running in Vercel Preview environment. Special handling is enabled to ensure functionality.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center py-4">
            <p className="text-gray-400 mb-6">
              Click the button below to set up the credit system. This will create all necessary database tables and
              functions.
            </p>

            <Button
              onClick={handleSetupCredits}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white px-8 py-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Setting Up...
                </>
              ) : (
                "Set Up Credit System"
              )}
            </Button>

            {result && (
              <div
                className={`mt-6 p-4 rounded-md ${
                  result.success
                    ? "bg-green-900/20 border border-green-900/30"
                    : "bg-red-900/20 border border-red-900/30"
                }`}
              >
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mr-2" />
                  )}
                  <p className={result.success ? "text-green-400" : "text-red-400"}>{result.message}</p>
                </div>
              </div>
            )}

            {logs.length > 0 && (
              <div className="mt-6 text-left">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Setup Logs:</h3>
                <div className="bg-black/50 border border-gray-800 rounded-md p-3 max-h-60 overflow-y-auto text-xs font-mono">
                  {logs.map((log, index) => (
                    <div key={index} className="text-gray-400 mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-purple-900/30 pt-4">
              <Link
                href="https://t.me/fansignpreviews"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Check out our previews on Telegram
              </Link>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-black/60 border-t border-purple-900/30 pt-4">
          <div className="w-full text-center text-xs text-gray-500">
            Admin Panel • Credit System Setup • {new Date().toLocaleDateString()}
            {isPreview && " • Preview Mode"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
