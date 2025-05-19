"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RefreshCw, Check, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { checkAdminStatus } from "@/app/actions/adminAuthActions"
import { useSearchParams } from "next/navigation"

export default function SetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("id")

  const [isLoading, setIsLoading] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [setupStatus, setSetupStatus] = useState<Record<string, "idle" | "loading" | "success" | "error">>({
    execSql: "idle",
    keySystem: "idle",
    initialKeys: "idle",
  })

  useEffect(() => {
    const checkAuth = async () => {
      if (userId) {
        const isAdminUser = await checkAdminStatus(userId)
        setIsAuthorized(isAdminUser)

        if (!isAdminUser) {
          toast({
            title: "Unauthorized",
            description: "You do not have permission to access this page",
            variant: "destructive",
          })
          router.push("/")
        }
      }
    }

    checkAuth()
  }, [userId, router])

  // Function to handle back button click
  const handleBackClick = () => {
    router.push("/admin")
  }

  // Function to setup exec_sql function
  const setupExecSql = async () => {
    setSetupStatus((prev) => ({ ...prev, execSql: "loading" }))

    try {
      const response = await fetch(`/api/admin/setup-exec-sql`, {
        method: "GET",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup exec_sql function")
      }

      setSetupStatus((prev) => ({ ...prev, execSql: "success" }))
      toast({
        title: "Success",
        description: data.message || "exec_sql function created successfully",
      })
    } catch (err: any) {
      setSetupStatus((prev) => ({ ...prev, execSql: "error" }))
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Function to setup key system
  const setupKeySystem = async () => {
    setSetupStatus((prev) => ({ ...prev, keySystem: "loading" }))

    try {
      const response = await fetch(`/api/admin/setup-key-system`, {
        method: "GET",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup key system")
      }

      setSetupStatus((prev) => ({ ...prev, keySystem: "success" }))
      toast({
        title: "Success",
        description: data.message || "Key system setup successfully",
      })
    } catch (err: any) {
      setSetupStatus((prev) => ({ ...prev, keySystem: "error" }))
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Function to generate initial keys
  const generateInitialKeys = async () => {
    setSetupStatus((prev) => ({ ...prev, initialKeys: "loading" }))

    try {
      const response = await fetch(`/api/admin/generate-initial-keys`, {
        method: "GET",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate initial keys")
      }

      setSetupStatus((prev) => ({ ...prev, initialKeys: "success" }))
      toast({
        title: "Success",
        description: "Initial keys generated successfully",
      })
    } catch (err: any) {
      setSetupStatus((prev) => ({ ...prev, initialKeys: "error" }))
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Function to run full setup
  const runFullSetup = async () => {
    setIsLoading(true)

    try {
      await setupExecSql()
      await setupKeySystem()
      await generateInitialKeys()

      toast({
        title: "Success",
        description: "Full setup completed successfully",
      })
    } catch (err) {
      console.error("Error during full setup:", err)
      toast({
        title: "Error",
        description: "An error occurred during setup. Check individual steps for details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to render status icon
  const renderStatusIcon = (status: "idle" | "loading" | "success" | "error") => {
    switch (status) {
      case "loading":
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
      case "success":
        return <Check className="w-5 h-5 text-green-400" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <div className="w-5 h-5" />
    }
  }

  if (!isAuthorized) {
    return <div>Checking authorization...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <Card className="w-full max-w-2xl mx-auto border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={handleBackClick} className="text-purple-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              System Setup
            </CardTitle>
            <div className="w-5"></div> {/* Empty div for alignment */}
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Setup Steps</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded border border-gray-700">
                <div>
                  <h3 className="font-medium">1. Setup SQL Execution Function</h3>
                  <p className="text-sm text-gray-400">Creates the exec_sql function in the database</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatusIcon(setupStatus.execSql)}
                  <Button
                    onClick={setupExecSql}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={setupStatus.execSql === "loading" || setupStatus.execSql === "success"}
                  >
                    {setupStatus.execSql === "loading" ? "Setting up..." : "Setup"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded border border-gray-700">
                <div>
                  <h3 className="font-medium">2. Setup Key Management System</h3>
                  <p className="text-sm text-gray-400">Creates tables and functions for key management</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatusIcon(setupStatus.keySystem)}
                  <Button
                    onClick={setupKeySystem}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={
                      setupStatus.keySystem === "loading" ||
                      setupStatus.keySystem === "success" ||
                      setupStatus.execSql !== "success"
                    }
                  >
                    {setupStatus.keySystem === "loading" ? "Setting up..." : "Setup"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded border border-gray-700">
                <div>
                  <h3 className="font-medium">3. Generate Initial Keys</h3>
                  <p className="text-sm text-gray-400">Creates the initial set of keys with specified allowances</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatusIcon(setupStatus.initialKeys)}
                  <Button
                    onClick={generateInitialKeys}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={
                      setupStatus.initialKeys === "loading" ||
                      setupStatus.initialKeys === "success" ||
                      setupStatus.keySystem !== "success"
                    }
                  >
                    {setupStatus.initialKeys === "loading" ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button
              onClick={runFullSetup}
              className="bg-gradient-to-r from-purple-600 to-violet-800 hover:from-purple-500 hover:to-violet-700 text-white px-8 py-2"
              disabled={isLoading || Object.values(setupStatus).some((status) => status === "loading")}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Run Full Setup
            </Button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://t.me/fansignpreviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              View Fansign Previews on Telegram
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
