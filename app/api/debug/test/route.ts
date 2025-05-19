import { NextResponse } from "next/server"
import { createServerSupabase } from "@/utils/supabase"

export async function GET() {
  try {
    // Test environment variables
    const envVars = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    // Test Supabase connection
    let supabaseStatus = "unknown"
    let supabaseError = null
    const tablesStatus = {}

    try {
      const supabase = createServerSupabase()

      // Simple ping test
      const { data, error } = await supabase.from("telegram_users").select("count").limit(1)

      if (error) {
        throw error
      }

      supabaseStatus = "success"

      // Check tables
      const tables = ["telegram_users", "keys", "image_generations"]
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select("count").limit(1)
          tablesStatus[table] = error ? "error" : "success"
        } catch (error) {
          tablesStatus[table] = "error"
        }
      }
    } catch (error: any) {
      supabaseStatus = "error"
      supabaseError = error.message
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envVars,
      supabase: {
        status: supabaseStatus,
        error: supabaseError,
        tables: tablesStatus,
      },
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
