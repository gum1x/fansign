"use server"

import { createServerSupabase } from "@/utils/supabase"

// Function to generate a key with specific generation allowance
export async function generateKeyWithAllowance(generationsAllowed: number, keyType = "STANDARD") {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("generate_key", {
      p_generations_allowed: generationsAllowed,
      p_key_type: keyType,
    })

    if (error) {
      console.error("Error generating key:", error)
      return { success: false, error: error.message }
    }

    return { success: true, key: data }
  } catch (error) {
    console.error("Unexpected error generating key:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Function to generate multiple keys with specific allowances
export async function generateMultipleKeys() {
  try {
    const supabase = createServerSupabase()
    const keys = []

    // Generate 1 key with 1 generation
    const key1 = await generateKeyWithAllowance(1, "BASIC")
    if (key1.success) keys.push({ key: key1.key, allowance: 1, type: "BASIC" })

    // Generate 1 key with 5 generations
    const key2 = await generateKeyWithAllowance(5, "STANDARD")
    if (key2.success) keys.push({ key: key2.key, allowance: 5, type: "STANDARD" })

    // Generate 1 key with 999 generations
    const key3 = await generateKeyWithAllowance(999, "UNLIMITED")
    if (key3.success) keys.push({ key: key3.key, allowance: 999, type: "UNLIMITED" })

    // Generate 7 keys with random allowances between 1-100
    for (let i = 0; i < 7; i++) {
      const randomAllowance = Math.floor(Math.random() * 100) + 1
      const keyType = randomAllowance <= 10 ? "BASIC" : randomAllowance <= 50 ? "STANDARD" : "PREMIUM"

      const key = await generateKeyWithAllowance(randomAllowance, keyType)
      if (key.success) keys.push({ key: key.key, allowance: randomAllowance, type: keyType })
    }

    return { success: true, keys }
  } catch (error) {
    console.error("Error generating multiple keys:", error)
    return { success: false, error: "Failed to generate keys" }
  }
}

// Function to redeem a key
export async function redeemKey(userId: string, keyCode: string) {
  try {
    if (!userId || !keyCode) {
      return {
        success: false,
        message: "User ID and key code are required",
      }
    }

    const supabase = createServerSupabase()

    // Call the redeem_key function
    const { data, error } = await supabase.rpc("redeem_key", {
      p_user_id: userId,
      p_key_code: keyCode,
    })

    if (error) {
      console.error("Error redeeming key:", error)
      return {
        success: false,
        message: "Failed to redeem key. Please try again later.",
        debug: error.message,
      }
    }

    // Return the result directly
    return {
      success: data.success,
      message: data.message,
      creditsAdded: data.creditsAdded,
      newCredits: data.newCredits,
      keyType: data.keyType,
    }
  } catch (error: any) {
    console.error("Unexpected error in redeemKey:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}

// Function to check key validity and remaining generations
export async function checkKey(keyCode: string) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("check_key", {
      p_key_code: keyCode,
    })

    if (error) {
      console.error("Error checking key:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      valid: data.valid,
      message: data.message,
      keyType: data.key_type,
      generationsAllowed: data.generations_allowed,
      generationsUsed: data.generations_used,
      generationsRemaining: data.generations_remaining,
      isUsed: data.is_used,
      isActive: data.is_active,
      expiresAt: data.expires_at,
    }
  } catch (error) {
    console.error("Unexpected error checking key:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Function to use credits
export async function useCredits(userId: string, amount = 1) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      }
    }

    const supabase = createServerSupabase()

    // Get current credits
    const { data: userData, error: userError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single()

    if (userError && userError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error getting user credits:", userError)
      return {
        success: false,
        message: "Failed to get user credits. Please try again later.",
      }
    }

    const currentCredits = userData?.credits || 0

    // Check if user has enough credits
    if (currentCredits < amount) {
      return {
        success: false,
        message: "Insufficient credits.",
        currentCredits,
        requiredCredits: amount,
      }
    }

    // Update credits
    const newCredits = currentCredits - amount
    const { error: updateError } = await supabase.from("user_credits").upsert({
      user_id: userId,
      credits: newCredits,
      updated_at: new Date().toISOString(),
    })

    if (updateError) {
      console.error("Error updating user credits:", updateError)
      return {
        success: false,
        message: "Failed to update user credits. Please try again later.",
      }
    }

    // Record the transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: -amount,
      transaction_type: "CREDIT_USAGE",
      description: "Image generation",
    })

    return {
      success: true,
      message: "Credits used successfully.",
      creditsUsed: amount,
      remainingCredits: newCredits,
    }
  } catch (error: any) {
    console.error("Unexpected error in useCredits:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}

// Function to get user credits
export async function getUserCredits(userId: string) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
        credits: 0,
      }
    }

    const supabase = createServerSupabase()

    // Get user credits
    const { data, error } = await supabase.from("user_credits").select("credits").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error getting user credits:", error)
      return {
        success: false,
        message: "Failed to get user credits. Please try again later.",
        credits: 0,
      }
    }

    // Return credits (0 if user not found)
    return {
      success: true,
      credits: data?.credits || 0,
    }
  } catch (error: any) {
    console.error("Unexpected error in getUserCredits:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      credits: 0,
    }
  }
}

// Function to generate keys
export async function generateKeys(keyType: string, count: number, adminId: string) {
  try {
    if (!keyType || count <= 0 || !adminId) {
      return {
        success: false,
        message: "Key type, count, and admin ID are required",
      }
    }

    const supabase = createServerSupabase()
    const keys: string[] = []

    // Generate keys
    for (let i = 0; i < count; i++) {
      const keyPrefix = keyType.substring(0, 3).toUpperCase()
      const uniqueId = Math.random().toString(36).substring(2, 10).toUpperCase()
      const key = `${keyPrefix}-${uniqueId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      // Calculate expiration date (30 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      // Insert key into database
      const { error } = await supabase.from("api_keys").insert({
        key_code: key,
        tier: keyType,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        created_by: adminId,
      })

      if (error) {
        console.error("Error generating key:", error)
        return {
          success: false,
          message: "Failed to generate keys. Please try again later.",
        }
      }

      keys.push(key)
    }

    return {
      success: true,
      message: `Generated ${count} ${keyType} keys successfully.`,
      keys,
    }
  } catch (error: any) {
    console.error("Unexpected error in generateKeys:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}

// Function to record key usage
export async function recordKeyUsage(keyCode: string, userId: string, endpoint?: string, details?: any) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("record_key_usage", {
      p_key_code: keyCode,
      p_user_id: userId,
      p_endpoint: endpoint,
      p_details: details ? JSON.stringify(details) : null,
    })

    if (error) {
      console.error("Error recording key usage:", error)
      return { success: false, error: error.message }
    }

    return {
      success: data.success,
      message: data.message,
      generationsUsed: data.generations_used,
      generationsRemaining: data.generations_remaining,
    }
  } catch (error: any) {
    console.error("Unexpected error recording key usage:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Function to get all keys
export async function getAllKeys() {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.from("keys").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching keys:", error)
      return { success: false, error: error.message }
    }

    return { success: true, keys: data }
  } catch (error: any) {
    console.error("Unexpected error fetching keys:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
