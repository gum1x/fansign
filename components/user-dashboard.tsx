"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/use-session"
import { UserCredits } from "./user-credits"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getSupabase } from "@/utils/supabase"
import { Key, ImageIcon, Clock, History, CreditCard } from "lucide-react"
import Link from "next/link"

interface UserData {
  id: string
  credits: number
  is_admin: boolean
}

interface UsageData {
  total: number
  today: number
  thisWeek: number
}

interface GeneratedImage {
  id: string
  created_at: string
  type: string
  url?: string
}

export function UserDashboard() {
  const router = useRouter()
  const { session, signOut } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [usageData, setUsageData] = useState<UsageData>({ total: 0, today: 0, thisWeek: 0 })
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([])
  const { toast } = useToast()
  const supabase = getSupabase()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true)
      try {
        // In a real implementation, we would fetch actual user data from Supabase
        // For demonstration, we'll use mock data
        const mockUserData = {
          id: "telegram-user-123",
          credits: 75,
          is_admin: false,
        }

        const mockUsageData = {
          total: 23,
          today: 3,
          thisWeek: 12,
        }

        const mockRecentImages = [
          { id: "img1", created_at: new Date(Date.now() - 86400000).toISOString(), type: "bophouse-classic" },
          { id: "img2", created_at: new Date(Date.now() - 172800000).toISOString(), type: "liv" },
          { id: "img3", created_at: new Date(Date.now() - 259200000).toISOString(), type: "times-square" },
        ]

        setUserData(mockUserData)
        setUsageData(mockUsageData)
        setRecentImages(mockRecentImages)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchUserData()
    }
  }, [session, toast])

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Format fansign type to readable text
  const formatFansignType = (type: string) => {
    if (type.startsWith("bophouse-")) {
      return `Bophouse (${type.replace("bophouse-", "")})`
    }
    if (type === "liv" || type === "livdigital") {
      return type === "liv" ? "LIV Digital" : "LIV (new)"
    }
    if (type === "times-square" || type === "times-square-2") {
      return `Times Square${type.endsWith("-2") ? " 2" : ""}`
    }
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (!isClient) {
    return null
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push("/generate")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Generate Image
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {session.firstName} {session.lastName}
          </span>
          <UserCredits />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push("/generate")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate
          </button>
          <button
            onClick={() => router.push("/redeem")}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Redeem Key
          </button>
          <button
            onClick={() => signOut()}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {userData && (
        <>
          {/* Credit and Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Credits Card */}
            <Card className="col-span-1 bg-gray-800/50 border-purple-700/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
                  Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{userData.credits}</div>
                <p className="text-sm text-gray-400 mt-1">Each image generation costs 1 credit</p>
                <div className="mt-4">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-600 hover:to-violet-800"
                  >
                    <Link href="/redeem">
                      <Key className="w-4 h-4 mr-2" />
                      Redeem Key
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-purple-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">Today</div>
                    <div className="font-medium">{usageData.today} fansigns</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">This Week</div>
                    <div className="font-medium">{usageData.thisWeek} fansigns</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">Total Generated</div>
                    <div className="font-medium">{usageData.total} fansigns</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-purple-500 text-purple-300 hover:bg-purple-900/30"
                >
                  <Link href="/generate">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate New
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gray-900/50 border-purple-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-purple-900/20 hover:text-purple-300"
                  >
                    <Link href="/generate">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Create Fansign
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-purple-900/20 hover:text-purple-300"
                  >
                    <Link href="/support">
                      <History className="mr-2 h-4 w-4" />
                      Support
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-purple-900/20 hover:text-purple-300"
                  >
                    <Link href="https://t.me/fansignpreviewsbot" target="_blank" rel="noopener noreferrer">
                      <Clock className="mr-2 h-4 w-4" />
                      Preview Channel
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-gray-900/50 border-purple-900/30">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="images">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800/40">
                  <TabsTrigger
                    value="images"
                    className="data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  >
                    Recent Images
                  </TabsTrigger>
                  <TabsTrigger
                    value="redemptions"
                    className="data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  >
                    Key Redemptions
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="images" className="mt-4">
                  {recentImages.length > 0 ? (
                    <div className="space-y-4">
                      {recentImages.map((image) => (
                        <div key={image.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-900/30 rounded flex items-center justify-center mr-3">
                              <ImageIcon className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="font-medium">{formatFansignType(image.type)}</div>
                              <div className="text-xs text-gray-400">{formatDate(image.created_at)}</div>
                            </div>
                          </div>
                          {image.url && (
                            <Button size="sm" variant="ghost" className="text-purple-300 hover:text-purple-200">
                              <Link href={image.url}>View</Link>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No images generated yet</p>
                      <Button asChild className="mt-4" variant="outline">
                        <Link href="/generate">Create Your First Fansign</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="redemptions" className="mt-4">
                  <div className="text-center py-8 text-gray-400">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No API keys redeemed yet</p>
                    <Button asChild className="mt-4" variant="outline">
                      <Link href="/redeem">Redeem an API Key</Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
