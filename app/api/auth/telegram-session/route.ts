import { NextResponse } from "next/server"
import { createHmac } from "crypto"

// Secret key for authentication - in production, use an environment variable
const AUTH_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Telegram Bot Token - used to validate the initData
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""

export async function POST(request: Request) {
  try {
    const { userId, initData } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // In a production environment, validate the initData from Telegram
    if (initData && TELEGRAM_BOT_TOKEN) {
      // Validate the data is actually from Telegram
      const isValid = validateTelegramWebAppData(initData, TELEGRAM_BOT_TOKEN)

      if (!isValid) {
        return NextResponse.json({ error: "Invalid Telegram Web App data" }, { status: 403 })
      }
    }

    // Generate a simple token with HMAC
    // This is a simplified approach - in production, use a proper JWT library
    const timestamp = Date.now()
    const expiresAt = timestamp + 3600000 // 1 hour from now

    const tokenData = `${userId}:${timestamp}:${expiresAt}`
    const signature = createHmac("sha256", AUTH_SECRET).update(tokenData).digest("hex")

    const token = Buffer.from(`${tokenData}:${signature}`).toString("base64")

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error in telegram-session API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Function to validate Telegram Web App data
function validateTelegramWebAppData(initData: string, botToken: string): boolean {
  try {
    // Parse the initData
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get("hash")

    if (!hash) return false

    // Remove the hash from the data before checking the signature
    urlParams.delete("hash")

    // Sort the params alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")

    // Create the secret key by getting the HMAC-SHA256 of the bot token
    const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest()

    // Calculate the hash of the data string
    const calculatedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

    // Compare the calculated hash with the provided hash
    return calculatedHash === hash
  } catch (error) {
    console.error("Error validating Telegram data:", error)
    return false
  }
}
