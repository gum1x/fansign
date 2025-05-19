import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  try {
    const { imageData } = await request.json()

    if (!imageData || typeof imageData !== "string") {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 })
    }

    // Extract the base64 data (remove the data:image/jpeg;base64, part)
    const base64Data = imageData.split(",")[1]
    if (!base64Data) {
      return NextResponse.json({ error: "Invalid image data format" }, { status: 400 })
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64")

    // Generate a unique ID for the image
    const id = nanoid(10)
    const filename = `fansign-${id}.jpg`

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      contentType: "image/jpeg",
      access: "public",
      addRandomSuffix: false,
    })

    return NextResponse.json({
      id,
      url: blob.url,
    })
  } catch (error) {
    console.error("Error storing image:", error)
    return NextResponse.json(
      { error: "Failed to store image", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
