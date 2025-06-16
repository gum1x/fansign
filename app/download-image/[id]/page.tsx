"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"

function DownloadImagePageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to get image URL from query params first
    const url = searchParams?.get("url")
    
    if (url) {
      setImageUrl(url)
      setIsLoading(false)
      return
    }

    // If no URL in params, try to fetch from API
    const imageId = params?.id as string
    if (imageId) {
      fetchImageUrl(imageId)
    } else {
      setError("No image ID provided")
      setIsLoading(false)
    }
  }, [params, searchParams])

  const fetchImageUrl = async (imageId: string) => {
    try {
      const response = await fetch(`/api/temp-image/${imageId}`)
      if (!response.ok) {
        throw new Error('Image not found')
      }
      const data = await response.json()
      setImageUrl(data.url)
    } catch (err) {
      console.error("Error fetching image:", err)
      setError("Image not found or has expired")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return

    try {
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `fansign-${new Date().getTime()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Download error:", err)
      setError("Failed to download image")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-purple-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              Download Your Fansign
            </CardTitle>
            <div className="w-5"></div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-4 bg-gradient-to-b from-gray-900/50 to-black/50">
          {isLoading ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <RefreshCw className="w-12 h-12 text-purple-400 mb-2 animate-spin" />
              </div>
              <div className="text-purple-300">Loading your image...</div>
            </div>
          ) : error ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-red-400">Error</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <Button asChild className="bg-purple-700 hover:bg-purple-600">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md overflow-hidden border border-purple-700/50">
                <img src={imageUrl || "/placeholder.svg"} alt="Your custom fansign" className="w-full h-auto" />
              </div>

              <p className="text-center text-gray-300 text-sm">Your custom fansign is ready to download!</p>

              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-purple-700/30">
                <h4 className="font-medium text-purple-300 mb-2">Download Instructions</h4>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal pl-5">
                  <li>Click the "Download Image" button below</li>
                  <li>
                    If the download doesn't start automatically, right-click on the image and select "Save Image As..."
                  </li>
                  <li>Check your device's download folder or photo gallery</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-black/60 border-t border-purple-900/30 pt-4 flex flex-col gap-3">
          <Button
            onClick={handleDownload}
            disabled={!imageUrl || isLoading}
            className="w-full bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950 text-white font-medium py-6 flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(138,43,226,0.3)] transition-all hover:shadow-[0_0_15px_rgba(138,43,226,0.5)]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1" />
                Download Image
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-400">
            If the download doesn't start automatically, try pressing and holding on the image and selecting "Save
            Image"
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function DownloadImagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Loading...</p>
        </div>
      </div>
    }>
      <DownloadImagePageContent />
    </Suspense>
  )
}