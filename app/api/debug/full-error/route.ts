import { NextResponse } from "next/server"
import { createServerSupabase } from "@/utils/supabase"

// Remove the import of redeemKey and getUserCredits which might be causing the "use server" error
// import { redeemKey, getUserCredits } from "@/app/actions/keyActions"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId") || "test-user-123"

    const results: Record<string, any> = {}

    // Test Supabase connection
    try {
      results.supabaseConnection = { status: "testing" }
      const supabase = createServerSupabase()
      const { data, error } = await supabase.from("telegram_users").select("count").limit(1)

      if (error) {
        results.supabaseConnection = {
          status: "error",
          error: error.message,
          details: error,
        }
      } else {
        results.supabaseConnection = {
          status: "success",
          data,
        }
      }
    } catch (error: any) {
      results.supabaseConnection = {
        status: "exception",
        error: error.message,
        stack: error.stack,
      }
    }

    // Test stored procedures
    try {
      results.storedProcedures = { status: "testing" }
      const supabase = createServerSupabase()

      // Test add_credits_to_user
      try {
        const { error } = await supabase.rpc("add_credits_to_user", {
          user_id_param: userId,
          credits_to_add: 5,
        })

        results.storedProcedures.addCredits = {
          status: error ? "error" : "success",
          error: error ? error.message : null,
        }
      } catch (error: any) {
        results.storedProcedures.addCredits = {
          status: "exception",
          error: error.message,
          stack: error.stack,
        }
      }

      // Test use_credit
      try {
        const { error } = await supabase.rpc("use_credit", {
          user_id_param: userId,
        })

        results.storedProcedures.useCredit = {
          status: error ? "error" : "success",
          error: error ? error.message : null,
        }
      } catch (error: any) {
        results.storedProcedures.useCredit = {
          status: "exception",
          error: error.message,
          stack: error.stack,
        }
      }
    } catch (error: any) {
      results.storedProcedures = {
        status: "exception",
        error: error.message,
        stack: error.stack,
      }
    }

    // Check environment variables
    results.environmentVariables = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({
      status: "fatal_error",
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      details: JSON.stringify(error, null, 2),
    })
  }
}
