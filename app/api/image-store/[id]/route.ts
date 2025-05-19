import { type NextRequest, NextResponse } from "next/server"

// Reference to the same in-memory storage
const imageStore = new Map<string, { data: string; expires: number }>()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
    }

    const image = imageStore.get(id)

    if (!image) {
      return NextResponse.json({ error: "Image not found or expired" }, { status: 404 })
    }

    // Check if image has expired
    if (image.expires < Date.now()) {
      imageStore.delete(id)
      return NextResponse.json({ error: "Image has expired" }, { status: 404 })
    }

    return NextResponse.json({ imageData: image.data })
  } catch (error) {
    console.error("Error retrieving image:", error)
    return NextResponse.json({ error: "Failed to retrieve image" }, { status: 500 })
  }
}
