"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function DownloadImagePage() {
  const searchParams = useSearchParams()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showManualInstructions, setShowManualInstructions] = useState(false)

  useEffect(() => {
    // Get the image URL from the query parameter
    const url = searchParams?.get("url")

    if (url) {
      setImageUrl(url)
      setIsLoading(false)
    } else {
      setError("Image URL not found")
      setIsLoading(false)
    }
  }, [searchParams])

  const handleDownload = () => {
    if (!imageUrl) return

    try {
      // Create a download link
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `fansign-${new Date().getTime()}.jpg`

      // Force download attribute for maximum compatibility
      link.setAttribute("download", `fansign-${new Date().getTime()}.jpg`)

      // Add to document
      document.body.appendChild(link)

      // Trigger click
      link.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)

        // Show success message
        setSuccessMessage("Download started! If it didn't work, try the manual download button below.")

        // Show manual download instructions after a short delay
        setTimeout(() => {
          setShowManualInstructions(true)
        }, 3000)
      }, 100)
    } catch (err) {
      console.error("Download error:", err)
      setError("Failed to download image automatically. Please try the manual download option.")
      setShowManualInstructions(true)
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
            <div className="w-5"></div> {/* Spacer for alignment */}
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
              <div className="text-red-400 font-medium">{error}</div>
              <p className="text-gray-300 mt-2">
                The image may have expired or been removed. Please return to the Telegram bot and try again.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md overflow-hidden border border-purple-700/50">
                <img src={imageUrl || "/placeholder.svg"} alt="Your custom fansign" className="w-full h-auto" />
              </div>
              {successMessage && (
                <div className="mt-2 text-center">
                  <p className="text-green-400 text-sm">{successMessage}</p>
                </div>
              )}
              <p className="text-center text-gray-300 text-sm">Your custom fansign is ready to download!</p>
            </div>
          )}
          {imageUrl && showManualInstructions && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-purple-700/30">
              <h4 className="font-medium text-purple-300 mb-2">Manual Download</h4>
              <p className="text-sm text-gray-300 mb-3">If automatic download didn't work, try these steps:</p>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal pl-5">
                <li>Press and hold on the image above</li>
                <li>Select "Save Image" or "Download Image" from the menu</li>
                <li>Check your device's download folder or photo gallery</li>
              </ol>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-black/60 border-t border-purple-900/30 pt-4">
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
        </CardFooter>
      </Card>
    </div>
  )
}
