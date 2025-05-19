import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get the image data from the query parameter
    const imageData = request.nextUrl.searchParams.get("data")

    if (!imageData) {
      return new Response("No image data provided", { status: 400 })
    }

    // Set appropriate headers for download
    const headers = new Headers()
    headers.set("Content-Type", "image/jpeg")
    headers.set("Content-Disposition", `attachment; filename="fansign-${Date.now()}.jpg"`)

    // Add cache control headers to prevent caching issues
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")

    // Add cross-origin headers
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "GET")

    // Convert base64 to binary
    let binaryData: Buffer
    try {
      const base64Data = imageData.split(",")[1]
      binaryData = Buffer.from(base64Data, "base64")
    } catch (error) {
      console.error("Error processing base64 data:", error)
      return new Response("Invalid image data format", { status: 400 })
    }

    // Return the image as a downloadable file
    return new Response(binaryData, {
      headers,
    })
  } catch (error) {
    console.error("Download API error:", error)
    return new Response("Error processing download", { status: 500 })
  }
}
