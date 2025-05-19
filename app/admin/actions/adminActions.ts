"use server"

import { checkAllPendingDeposits } from "../api/cron/check-deposits/route"
import { createServerSupabase } from "@/utils/supabase"
import { isAdmin } from "@/utils/adminUtils"

export async function checkDepositsServerAction() {
  try {
    // Directly call the function that handles deposit checking
    // instead of making an HTTP request to our own API
    const result = await checkAllPendingDeposits()

    return {
      success: true,
      message: "Deposits checked successfully",
      result,
    }
  } catch (error) {
    console.error("Error checking deposits:", error)
    return {
      success: false,
      error: "An error occurred while checking deposits",
    }
  }
}

export async function getSystemStats(userId: string) {
  try {
    // Check if user is admin
    if (!isAdmin(userId)) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    const supabase = createServerSupabase()

    // Get user count
    const { data: userCount, error: userError } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })

    if (userError) throw userError

    // Get total generations
    const { data: generationCount, error: genError } = await supabase
      .from("image_generations")
      .select("id", { count: "exact", head: true })

    if (genError) throw genError

    // Get active keys
    const { data: activeKeys, error: keyError } = await supabase
      .from("keys")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)

    if (keyError) throw keyError

    return {
      success: true,
      stats: {
        userCount: userCount.count,
        generationCount: generationCount.count,
        activeKeys: activeKeys.count,
      },
    }
  } catch (error) {
    console.error("Error getting system stats:", error)
    return {
      success: false,
      error: "An error occurred while getting system stats",
    }
  }
}
