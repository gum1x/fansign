"use server"

import { createServerSupabase } from "@/utils/supabase"

// Simplified key redemption function optimized for Telegram
export async function redeemKeySimple(userId: string, keyCode: string) {
  console.log(`Server action: Redeeming key ${keyCode} for user ${userId}`)

  try {
    if (!userId || !keyCode) {
      return {
        success: false,
        message: "User ID and key code are required",
      }
    }

    // Clean up the key code (remove spaces, convert to uppercase)
    const cleanKeyCode = keyCode.trim().toUpperCase()

    const supabase = createServerSupabase()

    // First, check if the key exists and is valid
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key_code", cleanKeyCode)
      .single()

    if (keyError) {
      console.error("Error checking key:", keyError)
      return {
        success: false,
        message: "Invalid key code. Please check and try again.",
      }
    }

    // Check if the key is already used
    if (keyData.used_by) {
      return {
        success: false,
        message: "This key has already been used.",
      }
    }

    // Check if the key is active
    if (!keyData.is_active) {
      return {
        success: false,
        message: "This key is inactive or has expired.",
      }
    }

    // Determine credits to add based on key tier
    let creditsToAdd = 0
    switch (keyData.tier) {
      case "BASIC":
        creditsToAdd = 10
        break
      case "STANDARD":
        creditsToAdd = 25
        break
      case "PREMIUM":
        creditsToAdd = 50
        break
      case "UNLIMITED":
        creditsToAdd = 100
        break
      default:
        creditsToAdd = 5 // Default value
    }

    // Get current user credits
    const { data: userData, error: userError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single()

    let currentCredits = 0
    if (!userError) {
      currentCredits = userData.credits || 0
    }

    // Calculate new credit balance
    const newCredits = currentCredits + creditsToAdd

    // Update user credits
    const { error: updateError } = await supabase.from("user_credits").upsert({
      user_id: userId,
      credits: newCredits,
      updated_at: new Date().toISOString(),
    })

    if (updateError) {
      console.error("Error updating user credits:", updateError)
      return {
        success: false,
        message: "Failed to update credits. Please try again later.",
      }
    }

    // Mark the key as used
    const { error: keyUpdateError } = await supabase
      .from("api_keys")
      .update({
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq("key_code", cleanKeyCode)

    if (keyUpdateError) {
      console.error("Error marking key as used:", keyUpdateError)
      // Don't fail the transaction, just log the error
    }

    // Record the transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: creditsToAdd,
      transaction_type: "KEY_REDEMPTION",
      description: `Redeemed ${keyData.tier} key: ${cleanKeyCode}`,
    })

    return {
      success: true,
      message: `Successfully redeemed ${keyData.tier} key!`,
      creditsAdded: creditsToAdd,
      newCredits: newCredits,
      keyType: keyData.tier,
    }
  } catch (error: any) {
    console.error("Unexpected error in redeemKeySimple:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}

// Function to get user credits with fallback
export async function getUserCreditsSimple(userId: string) {
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

      // Create user credits record if it doesn't exist
      if (error.code === "PGRST116") {
        const { error: insertError } = await supabase.from("user_credits").insert({
          user_id: userId,
          credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error creating user credits record:", insertError)
        }
      }

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
    console.error("Unexpected error in getUserCreditsSimple:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      credits: 0,
    }
  }
}
