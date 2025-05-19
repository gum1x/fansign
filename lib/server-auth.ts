import { cookies } from "next/headers"
import { verifyApiKey, type KeyPlan } from "./auth"

// This file contains server-only functions that use next/headers
// It should ONLY be imported in server components or API routes

// Get the current API key from cookies - SERVER VERSION
export function getCurrentApiKey(): string | null {
  const cookieStore = cookies()
  return cookieStore.get("api_key")?.value || null
}

// Verify the current API key from cookies
export async function verifyCurrentApiKey(): Promise<{
  valid: boolean
  plan?: KeyPlan
  expiresAt?: string
  remainingDaily?: number
  remainingMonthly?: number
}> {
  const apiKey = getCurrentApiKey()

  if (!apiKey) {
    return { valid: false }
  }

  return await verifyApiKey(apiKey)
}
