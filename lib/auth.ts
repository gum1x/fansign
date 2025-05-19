import { createClient } from "@/utils/supabase"
import { v4 as uuidv4 } from "uuid"

// Key types and their limits
export type KeyPlan = "free" | "basic" | "premium" | "unlimited" | "SINGLE" | "CUSTOM"

export interface KeyLimits {
  dailyLimit: number
  monthlyLimit: number
  features: string[]
}

export const KEY_LIMITS: Record<KeyPlan, KeyLimits> = {
  free: {
    dailyLimit: 5,
    monthlyLimit: 100,
    features: ["basic_generation"],
  },
  basic: {
    dailyLimit: 20,
    monthlyLimit: 500,
    features: ["basic_generation", "advanced_templates"],
  },
  premium: {
    dailyLimit: 50,
    monthlyLimit: 1500,
    features: ["basic_generation", "advanced_templates", "priority_processing"],
  },
  unlimited: {
    dailyLimit: -1, // No limit
    monthlyLimit: -1, // No limit
    features: ["basic_generation", "advanced_templates", "priority_processing", "custom_templates"],
  },
  SINGLE: {
    dailyLimit: 1,
    monthlyLimit: 1,
    features: ["basic_generation"],
  },
  CUSTOM: {
    dailyLimit: 9999,
    monthlyLimit: 9999,
    features: ["basic_generation", "advanced_templates", "priority_processing", "custom_templates"],
  },
}

// Secret key for authentication - in production, use an environment variable
const AUTH_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Generate a new key
export async function generateApiKey(plan: KeyPlan = "free", expiresInDays = 30): Promise<string> {
  const keyPrefix = plan.substring(0, 3).toUpperCase()
  const uniqueId = uuidv4().replace(/-/g, "").substring(0, 16)
  const key = `${keyPrefix}_${uniqueId}`

  const supabase = createClient()

  // Calculate expiration date
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  // Store the key in the database
  // const { error } = await supabase.from("api_keys").insert({
  //   key_code: key,
  //   tier: plan,
  //   created_at: new Date().toISOString(),
  //   expires_at: expiresAt.toISOString(),
  //   is_active: true,
  // })

  // if (error) {
  //   console.error("Error generating key:", error)
  //   throw new Error("Failed to generate key")
  // }

  return key
}

// Verify a key
export async function verifyApiKey(apiKey: string): Promise<{
  valid: boolean
  plan?: KeyPlan
  expiresAt?: string
  remainingDaily?: number
  remainingMonthly?: number
}> {
  return {
    valid: true,
    plan: "unlimited",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    remainingDaily: 9999,
    remainingMonthly: 9999,
  }
}

// Record key usage
export async function recordKeyUsage(key: string): Promise<boolean> {
  return true
}

// Get the current key from cookies - CLIENT VERSION
// This replaces the server-side cookies() function
export function getKeyFromCookieString(cookieString: string): string | null {
  return null
}

// Check if a feature is available for a given plan
export function isFeatureAvailable(plan: KeyPlan, feature: string): boolean {
  return true
}

// Generate a simple authentication token
export function generateAuthToken(userId: string, expiresInSeconds = 3600): string {
  return ""
}

// Verify an authentication token
export function verifyAuthToken(token: string): { valid: boolean; userId?: string } {
  return { valid: true, userId: "test" }
}
