import { NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    // Get the auth token from the request
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    // If no token in header, check cookies from the request
    const cookieHeader = request.headers.get("Cookie") || ""
    const cookies = parseCookies(cookieHeader)
    const telegramToken = cookies["telegram_auth_token"]

    const tokenToVerify = token || telegramToken

    if (!tokenToVerify) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the token
    const { valid, userId } = verifyAuthToken(tokenToVerify)

    if (!valid || !userId) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 403 })
    }

    // Get the image data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate a unique filename
    const filename = `${userId}-${Date.now()}-${file.name}`

    // Upload the file to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      success: true,
    })
  } catch (error) {
    console.error("Error in temp-image API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to parse cookies from a cookie header string
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}

  if (!cookieHeader) return cookies

  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=")
    if (name && value) {
      cookies[name] = decodeURIComponent(value)
    }
  })

  return cookies
}
