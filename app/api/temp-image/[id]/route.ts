import { NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { createClient } from "@/utils/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
    }

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

    // Create Supabase client
    const supabase = createClient()

    // Get the image data
    const { data, error } = await supabase.from("temp_images").select("*").eq("id", id).eq("user_id", userId).single()

    if (error) {
      console.error("Error fetching image:", error)
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in temp-image/[id] API:", error)
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
