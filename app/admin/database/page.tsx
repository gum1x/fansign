"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Database, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { executeAdminQuery, checkAdminStatus } from "@/app/actions/adminAuthActions"
import { useSearchParams } from "next/navigation"

export default function DatabaseManagementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("id")

  const [sqlQuery, setSqlQuery] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

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

  // Function to execute SQL query
  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const { success, result, error } = await executeAdminQuery(sqlQuery)

      if (!success) {
        throw new Error(error || "Failed to execute query")
      }

      setResult(result)
      toast({
        title: "Success",
        description: "Query executed successfully",
      })
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to setup key system
  const setupKeySystem = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/setup-key-system`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup key system")
      }

      toast({
        title: "Success",
        description: data.message || "Key system setup successfully",
      })
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthorized) {
    return <div>Checking authorization...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <Card className="w-full max-w-4xl mx-auto border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={handleBackClick} className="text-purple-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              Database Management
            </CardTitle>
            <div className="w-5"></div> {/* Empty div for alignment */}
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-4">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-purple-300 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Database Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button
                onClick={setupKeySystem}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                Setup Key System
              </Button>

              <Button onClick={() => router.push("/admin/keys")} className="bg-blue-600 hover:bg-blue-700 text-white">
                Manage Keys
              </Button>
            </div>

            <div className="mt-4 mb-6">
              <a
                href="https://t.me/fansignpreviews"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-md transition-colors"
              >
                View Fansign Previews on Telegram
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Execute SQL Query</h2>

            <Textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Enter SQL query..."
              className="min-h-[150px] mb-4 bg-gray-800 border-gray-700 text-white"
            />

            <Button
              onClick={executeQuery}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Execute Query
            </Button>

            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-400">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-4">
                <h3 className="font-semibold text-purple-300 mb-2">Result:</h3>
                <div className="bg-gray-800 p-4 rounded border border-gray-700 overflow-auto max-h-[300px]">
                  <pre className="text-sm text-gray-300">{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
