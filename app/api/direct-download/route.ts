import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the image data from the request
    const formData = await request.formData()
    const imageData = formData.get("imageData") as string

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    // Extract the base64 data
    const base64Data = imageData.split(",")[1]
    const binaryData = Buffer.from(base64Data, "base64")

    // Set headers for direct download
    const headers = new Headers()
    headers.set("Content-Type", "image/jpeg")
    headers.set("Content-Disposition", `attachment; filename="fansign-${Date.now()}.jpg"`)
    headers.set("Content-Length", binaryData.length.toString())

    // Return the image as a downloadable file
    return new NextResponse(binaryData, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error processing direct download:", error)
    return NextResponse.json({ error: "Failed to process download" }, { status: 500 })
  }
}
