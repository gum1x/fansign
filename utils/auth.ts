import { createClient } from "@/utils/supabase"
import * as crypto from "crypto"

// Simple function to verify API keys
export async function verifyApiKey(apiKey: string) {
  try {
    const supabase = createClient()

    // Query the api_keys table
    const { data, error } = await supabase.from("api_keys").select("*").eq("key", apiKey).single()

    if (error || !data) {
      return { valid: false }
    }

    // Check if the key is active
    if (!data.is_active) {
      return { valid: false }
    }

    // Check if the key has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false }
    }

    // Return key details
    return {
      valid: true,
      plan: data.plan,
      expiresAt: data.expires_at,
      remainingDaily: 100, // Placeholder - implement actual usage tracking
      remainingMonthly: 1000, // Placeholder - implement actual usage tracking
    }
  } catch (error) {
    console.error("Error verifying API key:", error)
    return { valid: false }
  }
}

// Generate a secure token
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString("hex")
}

// Simple function to hash a string
export function hashString(str: string) {
  return crypto.createHash("sha256").update(str).digest("hex")
}
