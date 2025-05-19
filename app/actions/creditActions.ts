"use server"

import { createServerSupabase } from "@/utils/supabase"

// Function to generate a distribution key
export async function generateDistributionKey(creditsValue: number, keyType = "STANDARD", adminId?: string) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("generate_distribution_key", {
      p_credits_value: creditsValue,
      p_key_type: keyType,
      p_admin_id: adminId || null,
    })

    if (error) {
      console.error("Error generating distribution key:", error)
      return { success: false, error: error.message }
    }

    return { success: true, key: data }
  } catch (error: any) {
    console.error("Unexpected error generating distribution key:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Function to generate multiple keys with specific credit values
export async function generateMultipleKeys(
  adminId: string,
  keyConfig: Record<string, { count: number; credits: number }>,
) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("generate_multiple_keys", {
      p_admin_id: adminId,
      p_key_counts: keyConfig,
    })

    if (error) {
      console.error("Error generating multiple keys:", error)
      return { success: false, error: error.message }
    }

    return { success: true, keys: data.keys }
  } catch (error: any) {
    console.error("Error generating multiple keys:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Function to assign credits to a user using a key
export async function assignCreditsWithKey(userId: string, keyCode: string, adminId?: string) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("assign_credits_with_key", {
      p_user_id: userId,
      p_key_code: keyCode,
      p_admin_id: adminId || null,
    })

    if (error) {
      console.error("Error assigning credits with key:", error)
      return { success: false, error: error.message }
    }

    return {
      success: data.success,
      message: data.message,
      creditsAdded: data.credits_added,
      newCredits: data.new_credits,
      keyType: data.key_type,
    }
  } catch (error: any) {
    console.error("Unexpected error assigning credits with key:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Function to directly assign credits to a user by admin
export async function adminAssignCredits(userId: string, amount: number, adminId: string, description?: string) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("admin_assign_credits", {
      p_user_id: userId,
      p_amount: amount,
      p_admin_id: adminId,
      p_description: description || "Admin credit assignment",
    })

    if (error) {
      console.error("Error assigning credits by admin:", error)
      return { success: false, error: error.message }
    }

    return {
      success: data.success,
      message: data.message,
      creditsAdded: data.credits_added,
      newCredits: data.new_credits,
    }
  } catch (error: any) {
    console.error("Unexpected error assigning credits by admin:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Function to use credits
export async function useCredits(userId: string, amount = 1, description?: string) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("use_credits", {
      p_user_id: userId,
      p_amount: amount,
      p_description: description || "Image generation",
    })

    if (error) {
      console.error("Error using credits:", error)
      return { success: false, error: error.message }
    }

    return {
      success: data.success,
      message: data.message,
      creditsUsed: data.credits_used,
      remainingCredits: data.remaining_credits,
    }
  } catch (error: any) {
    console.error("Unexpected error using credits:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Function to get user credit balance
export async function getUserCredits(userId: string) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("get_user_credits", {
      p_user_id: userId,
    })

    if (error) {
      console.error("Error getting user credits:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      userId: data.user_id,
      credits: data.credits,
      totalReceived: data.total_received,
      totalUsed: data.total_used,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      exists: data.exists,
    }
  } catch (error: any) {
    console.error("Unexpected error getting user credits:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Function to get credit transaction history for a user
export async function getUserTransactions(userId: string, limit = 50, offset = 0) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("get_user_transactions", {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
    })

    if (error) {
      console.error("Error getting user transactions:", error)
      return { success: false, error: error.message }
    }

    return { success: true, transactions: data }
  } catch (error: any) {
    console.error("Unexpected error getting user transactions:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Function to validate a key without using it
export async function validateKey(keyCode: string) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase.rpc("validate_key", {
      p_key_code: keyCode,
    })

    if (error) {
      console.error("Error validating key:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      valid: data.valid,
      message: data.message,
      keyType: data.key_type,
      creditsValue: data.credits_value,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    }
  } catch (error: any) {
    console.error("Unexpected error validating key:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Function to get all distribution keys
export async function getAllDistributionKeys(limit = 100, offset = 0, filters?: any) {
  try {
    const supabase = createServerSupabase()

    let query = supabase
      .from("distribution_keys")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Apply filters if provided
    if (filters) {
      if (filters.keyType) {
        query = query.eq("key_type", filters.keyType)
      }

      if (filters.isUsed !== undefined) {
        query = query.eq("is_used", filters.isUsed)
      }

      if (filters.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive)
      }

      if (filters.search) {
        query = query.ilike("key_code", `%${filters.search}%`)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching distribution keys:", error)
      return { success: false, error: error.message }
    }

    return { success: true, keys: data }
  } catch (error: any) {
    console.error("Unexpected error fetching distribution keys:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
