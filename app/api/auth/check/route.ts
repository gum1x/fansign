import { NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ valid: false, error: "API key is required" }, { status: 400 })
    }

    const result = await verifyApiKey(apiKey)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error checking API key:", error)
    return NextResponse.json({ valid: false, error: "Failed to check API key" }, { status: 500 })
  }
}
