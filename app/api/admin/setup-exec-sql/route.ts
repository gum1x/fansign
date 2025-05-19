import { createServerSupabase } from "@/utils/supabase"
import { NextResponse } from "next/server"
import { isAdmin } from "@/utils/adminUtils"

export async function GET(request: Request) {
  try {
    // Get the URL parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    // Check if the user is an admin
    if (userId && !(await isAdmin(userId))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabase()

    // SQL to create the exec_sql function
    const sql = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS json
      LANGUAGE plpgsql
      AS $$
      DECLARE
        result json;
      BEGIN
        EXECUTE sql INTO result;
        RETURN result;
      EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
      END;
      $$;
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("Error creating exec_sql function:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "exec_sql function created successfully" })
  } catch (error: any) {
    console.error("Unexpected error creating exec_sql function:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
