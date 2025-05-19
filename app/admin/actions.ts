"use server"

import { createClient } from "@/utils/supabase"
import { generateApiKey, type KeyPlan } from "@/lib/auth"

// Get all API keys with optional filtering
export async function getKeys({
  plan,
  isActive,
  search,
}: {
  plan?: KeyPlan
  isActive?: boolean
  search?: string
} = {}) {
  try {
    const supabase = createClient()

    let query = supabase.from("api_keys").select("*")

    // Apply filters
    if (plan) {
      query = query.eq("plan", plan)
    }

    if (isActive !== undefined) {
      query = query.eq("is_active", isActive)
    }

    if (search) {
      query = query.ilike("key", `%${search}%`)
    }

    // Order by creation date, newest first
    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching keys:", error)
      return { success: false, error: "Failed to fetch keys" }
    }

    return { success: true, keys: data }
  } catch (error) {
    console.error("Error in getKeys:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Generate a new API key
export async function generateNewKey(plan: KeyPlan, expiresInDays: number) {
  try {
    const key = await generateApiKey(plan, expiresInDays)
    return { success: true, key }
  } catch (error) {
    console.error("Error generating key:", error)
    return { success: false, error: "Failed to generate key" }
  }
}

// Deactivate an API key
export async function deactivateKey(keyId: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("api_keys").update({ is_active: false }).eq("id", keyId)

    if (error) {
      console.error("Error deactivating key:", error)
      return { success: false, error: "Failed to deactivate key" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deactivateKey:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Reactivate an API key
export async function reactivateKey(keyId: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("api_keys").update({ is_active: true }).eq("id", keyId)

    if (error) {
      console.error("Error reactivating key:", error)
      return { success: false, error: "Failed to reactivate key" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in reactivateKey:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Extend key expiration
export async function extendKeyExpiration(keyId: string, days: number) {
  try {
    const supabase = createClient()

    // First, get the current expiration date
    const { data, error: fetchError } = await supabase.from("api_keys").select("expires_at").eq("id", keyId).single()

    if (fetchError) {
      console.error("Error fetching key:", fetchError)
      return { success: false, error: "Failed to fetch key" }
    }

    // Calculate new expiration date
    const currentExpiration = new Date(data.expires_at)
    const newExpiration = new Date(currentExpiration)
    newExpiration.setDate(newExpiration.getDate() + days)

    // Update the expiration date
    const { error: updateError } = await supabase
      .from("api_keys")
      .update({ expires_at: newExpiration.toISOString() })
      .eq("id", keyId)

    if (updateError) {
      console.error("Error extending key:", updateError)
      return { success: false, error: "Failed to extend key" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in extendKeyExpiration:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
