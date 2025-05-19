import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, fansignType, timestamp } = await request.json()

    // Log the image generation (in a real app, store this in a database)
    console.log(`Image generation: User ${userId} generated a ${fansignType} image at ${timestamp}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging image generation:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
