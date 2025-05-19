import { NextResponse } from "next/server"
import { createServerSupabase } from "@/utils/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabase()
    const testUserId = "debug-test-" + Math.floor(Math.random() * 1000)

    // Test results
    const results = {
      createUser: null,
      addCredits: null,
      useCredit: null,
      cleanup: null,
    }

    // Step 1: Create a test user
    try {
      const { error } = await supabase.from("telegram_users").insert({
        id: testUserId,
        credits: 0,
        balance: 0,
        is_admin: false,
      })

      results.createUser = error ? { success: false, error: error.message } : { success: true }
    } catch (error: any) {
      results.createUser = { success: false, error: error.message }
    }

    // Step 2: Test add_credits_to_user procedure
    try {
      const { error } = await supabase.rpc("add_credits_to_user", {
        user_id_param: testUserId,
        credits_to_add: 5,
      })

      results.addCredits = error ? { success: false, error: error.message } : { success: true }
    } catch (error: any) {
      results.addCredits = { success: false, error: error.message }
    }

    // Step 3: Test use_credit procedure
    try {
      const { error } = await supabase.rpc("use_credit", {
        user_id_param: testUserId,
      })

      results.useCredit = error ? { success: false, error: error.message } : { success: true }
    } catch (error: any) {
      results.useCredit = { success: false, error: error.message }
    }

    // Step 4: Clean up test user
    try {
      const { error } = await supabase.from("telegram_users").delete().eq("id", testUserId)

      results.cleanup = error ? { success: false, error: error.message } : { success: true }
    } catch (error: any) {
      results.cleanup = { success: false, error: error.message }
    }

    return NextResponse.json({
      testUserId,
      results,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
