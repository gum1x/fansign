import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase"
import { verifyAuthToken } from "@/lib/auth"

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

    // Create Supabase client
    const supabase = createClient()

    // Deduct one credit using the new function
    const { data, error } = await supabase.rpc("use_credits", {
      p_user_id: userId,
      p_amount: 1,
    })

    if (error) {
      console.error("Error deducting credit:", error)
      return NextResponse.json({ success: false, error: "Failed to deduct credit" }, { status: 500 })
    }

    // Return the result directly
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in use-credit API:", error)
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
