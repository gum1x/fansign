import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Download Your Fansign",
  description: "Download your custom fansign image",
}

async function getImageUrl(id: string) {
  try {
    // Use the absolute URL to the API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/temp-image/${id}`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`Error fetching image: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error fetching image:", error)
    return null
  }
}

export default async function DownloadImagePage({ params }: { params: { id: string } }) {
  const imageId = params.id
  const imageUrl = await getImageUrl(imageId)

  if (!imageUrl) {
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
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-red-400">Error</h3>
              <p className="text-gray-300 mb-4">The image could not be found or has expired.</p>
              <Button asChild className="bg-purple-700 hover:bg-purple-600">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
        </CardContent>

        <CardFooter className="bg-black/60 border-t border-purple-900/30 pt-4 flex flex-col gap-3">
          <a
            href={imageUrl}
            download={`fansign-${Date.now()}.jpg`}
            className="w-full bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950 text-white font-medium py-6 flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(138,43,226,0.3)] transition-all hover:shadow-[0_0_15px_rgba(138,43,226,0.5)] rounded-md"
          >
            <Download className="w-4 h-4 mr-1" />
            Download Image
          </a>

          <p className="text-xs text-center text-gray-400">
            If the download doesn't start automatically, try pressing and holding on the image and selecting "Save
            Image"
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
