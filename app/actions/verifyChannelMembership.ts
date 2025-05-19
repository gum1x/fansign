"use server"

import { cookies } from "next/headers"
import { createServerSupabase } from "@/utils/supabase"

// This function is now simplified since we're not requiring channel membership
export async function verifyChannelMembership(userId: string) {
  try {
    // Simply verify that we have a user ID
    if (!userId) {
      return { success: false, error: "User ID not provided" }
    }

    // Set a cookie to remember verification for 24 hours
    const cookieStore = cookies()
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + 24)

    cookieStore.set({
      name: "user_verified",
      value: userId,
      expires: expiryDate,
      path: "/",
      secure: true,
      sameSite: "strict",
    })

    // Check if user exists in Supabase, if not create them
    const supabase = createServerSupabase()
    const { data: existingUser } = await supabase.from("users").select("id").eq("id", userId).single()

    if (!existingUser) {
      // Create new user with $5 starting balance
      await supabase.from("users").insert([{ id: userId, balance: 5, is_admin: false }])
    }

    return { success: true }
  } catch (error) {
    console.error("Error verifying user:", error)
    return {
      success: false,
      error: `Verification failed: ${error.message || "Unknown error"}`,
    }
  }
}

// Function to check if user has a valid verification cookie
export async function hasValidVerification() {
  const cookieStore = cookies()
  return cookieStore.has("user_verified")
}
