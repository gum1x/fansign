import { createServerSupabase } from "@/utils/supabase"
import { NextResponse } from "next/server"
import { isAdmin } from "@/utils/adminUtils"

export async function POST(request: Request) {
  try {
    const { query, token, userId } = await request.json()

    // Check for admin token or admin user
    const isValidToken = token === process.env.ADMIN_SECRET_KEY
    const isAdminUser = userId ? await isAdmin(userId) : false

    if (!isValidToken && !isAdminUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (!query) {
      return NextResponse.json({ success: false, error: "No query provided" }, { status: 400 })
    }

    const supabase = createServerSupabase()

    // Execute the SQL query
    const { data, error } = await supabase.rpc("exec_sql", { sql: query })

    if (error) {
      console.error("Error executing SQL query:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, result: data })
  } catch (error: any) {
    console.error("Unexpected error executing SQL query:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
