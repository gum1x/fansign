"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Key, Settings, BarChart, MessageSquare, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { checkAdminStatus } from "@/app/actions/adminAuthActions"
import { toast } from "@/components/ui/use-toast"

export default function AdminPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("id")

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
      setIsLoading(false)
    }

    checkAuth()
  }, [userId, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-xl font-semibold">Unauthorized. Please log in as an admin.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <Card className="w-full max-w-4xl mx-auto border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50">
          <CardTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Admin Dashboard
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 pb-4">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push(`/admin/keys?id=${userId}`)}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white h-auto py-3 flex items-center justify-center"
              >
                <Key className="w-5 h-5 mr-2" />
                Manage Keys
              </Button>

              <Button
                onClick={() => router.push(`/admin/database?id=${userId}`)}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white h-auto py-3 flex items-center justify-center"
              >
                <Database className="w-5 h-5 mr-2" />
                Database Management
              </Button>

              <Button
                onClick={() => router.push(`/admin/setup?id=${userId}`)}
                className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white h-auto py-3 flex items-center justify-center"
              >
                <Settings className="w-5 h-5 mr-2" />
                System Setup
              </Button>

              <Button
                onClick={() => router.push(`/admin/settings?id=${userId}`)}
                className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 text-white h-auto py-3 flex items-center justify-center"
              >
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </Button>

              <Button
                onClick={() => router.push(`/admin/support?id=${userId}`)}
                className="bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-500 hover:to-pink-700 text-white h-auto py-3 flex items-center justify-center"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Support Messages
              </Button>

              <Button
                onClick={() => router.push(`/admin/setup-credits?id=${userId}`)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white h-auto py-3 flex items-center justify-center"
              >
                <BarChart className="w-5 h-5 mr-2" />
                Setup Credits
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">External Links</h2>
            <div className="grid grid-cols-1 gap-4">
              <a
                href="https://t.me/fansignpreviews"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white h-auto py-3 px-4 rounded-md flex items-center justify-center"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                View Fansign Previews on Telegram
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-4">System Status</h2>
            <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Database Connection</span>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">API Status</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Admin Access</span>
                <span className="text-green-400">Granted</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}
