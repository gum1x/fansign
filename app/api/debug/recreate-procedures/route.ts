import { NextResponse } from "next/server"
import { createServerSupabase } from "@/utils/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabase()

    // SQL to recreate the stored procedures
    const sql = `
    -- Function to safely add credits to a user
    CREATE OR REPLACE FUNCTION add_credits_to_user(user_id_param TEXT, credits_to_add INTEGER)
    RETURNS VOID AS $$
    BEGIN
      -- First check if user exists
      IF EXISTS (SELECT 1 FROM telegram_users WHERE id = user_id_param) THEN
        -- Update existing user
        UPDATE telegram_users 
        SET credits = COALESCE(credits, 0) + credits_to_add,
            updated_at = NOW()
        WHERE id = user_id_param;
      ELSE
        -- Create new user with credits
        INSERT INTO telegram_users (id, credits, balance, is_admin, created_at, updated_at)
        VALUES (user_id_param, credits_to_add, 0, false, NOW(), NOW());
      END IF;
    END;
    $$ LANGUAGE plpgsql;

    -- Function to safely use a credit
    CREATE OR REPLACE FUNCTION use_credit(user_id_param TEXT)
    RETURNS VOID AS $$
    BEGIN
      UPDATE telegram_users 
      SET credits = GREATEST(COALESCE(credits, 0) - 1, 0),
          updated_at = NOW()
      WHERE id = user_id_param
      AND COALESCE(credits, 0) > 0;
    END;
    $$ LANGUAGE plpgsql;
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      // If the exec_sql function doesn't exist, we need to use a different approach
      return NextResponse.json({
        error: error.message,
        hint: "The exec_sql function might not exist. Please run the SQL manually in the database.",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Stored procedures recreated successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        sql: `
      -- Function to safely add credits to a user
      CREATE OR REPLACE FUNCTION add_credits_to_user(user_id_param TEXT, credits_to_add INTEGER)
      RETURNS VOID AS $$
      BEGIN
        -- First check if user exists
        IF EXISTS (SELECT 1 FROM telegram_users WHERE id = user_id_param) THEN
          -- Update existing user
          UPDATE telegram_users 
          SET credits = COALESCE(credits, 0) + credits_to_add,
              updated_at = NOW()
          WHERE id = user_id_param;
        ELSE
          -- Create new user with credits
          INSERT INTO telegram_users (id, credits, balance, is_admin, created_at, updated_at)
          VALUES (user_id_param, credits_to_add, 0, false, NOW(), NOW());
        END IF;
      END;
      $$ LANGUAGE plpgsql;

      -- Function to safely use a credit
      CREATE OR REPLACE FUNCTION use_credit(user_id_param TEXT)
      RETURNS VOID AS $$
      BEGIN
        UPDATE telegram_users 
        SET credits = GREATEST(COALESCE(credits, 0) - 1, 0),
            updated_at = NOW()
        WHERE id = user_id_param
        AND COALESCE(credits, 0) > 0;
      END;
      $$ LANGUAGE plpgsql;
      `,
      },
      { status: 500 },
    )
  }
}
