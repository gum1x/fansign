import { NextResponse } from "next/server"
import { createServerSupabase } from "@/utils/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabase()

    // Check if the stored procedures exist
    const { data, error } = await supabase.rpc("check_function_exists", {
      function_name: "add_credits_to_user",
    })

    if (error) {
      return NextResponse.json({
        error: error.message,
        hint: "The check_function_exists function might not exist. Let's check the functions directly.",
      })
    }

    // Fallback: Query the information schema directly
    const { data: functions, error: functionsError } = await supabase
      .from("pg_catalog.pg_proc")
      .select("proname")
      .contains("proname", ["add_credits_to_user", "use_credit"])

    if (functionsError) {
      return NextResponse.json({
        error: functionsError.message,
        hint: "Cannot query pg_catalog. Let's try a different approach.",
      })
    }

    // If we can't query the catalog, let's try to execute the functions with dummy data
    const testResults = {
      add_credits_to_user: null,
      use_credit: null,
    }

    try {
      const { error: addCreditsError } = await supabase.rpc("add_credits_to_user", {
        user_id_param: "test-user-999",
        credits_to_add: 1,
      })

      testResults.add_credits_to_user = {
        exists: !addCreditsError || !addCreditsError.message.includes("does not exist"),
        error: addCreditsError ? addCreditsError.message : null,
      }
    } catch (e: any) {
      testResults.add_credits_to_user = {
        exists: false,
        error: e.message,
      }
    }

    try {
      const { error: useCreditError } = await supabase.rpc("use_credit", {
        user_id_param: "test-user-999",
      })

      testResults.use_credit = {
        exists: !useCreditError || !useCreditError.message.includes("does not exist"),
        error: useCreditError ? useCreditError.message : null,
      }
    } catch (e: any) {
      testResults.use_credit = {
        exists: false,
        error: e.message,
      }
    }

    return NextResponse.json({
      functions: functions || [],
      testResults,
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
