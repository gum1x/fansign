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

    // SQL to create the key management tables and functions
    const sql = `
      -- Create API keys table if it doesn't exist
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        key_value VARCHAR(255) UNIQUE NOT NULL,
        key_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        used_by VARCHAR(255),
        used_at TIMESTAMP WITH TIME ZONE,
        credits INTEGER DEFAULT 0
      );

      -- Create user credits table if it doesn't exist
      CREATE TABLE IF NOT EXISTS user_credits (
        user_id VARCHAR(255) PRIMARY KEY,
        total_credits INTEGER DEFAULT 0,
        used_credits INTEGER DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create credit transactions table if it doesn't exist
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        key_value VARCHAR(255),
        credits_amount INTEGER NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user_credits(user_id) ON DELETE CASCADE
      );

      -- Create function to redeem a key and add credits to user
      CREATE OR REPLACE FUNCTION redeem_key(p_key_value VARCHAR, p_user_id VARCHAR)
      RETURNS JSON
      LANGUAGE plpgsql
      AS $$
      DECLARE
        v_key_type VARCHAR;
        v_credits INTEGER;
        v_result JSON;
      BEGIN
        -- Check if key exists and is unused
        SELECT key_type, credits INTO v_key_type, v_credits
        FROM api_keys
        WHERE key_value = p_key_value AND used_by IS NULL;
        
        IF v_key_type IS NULL THEN
          RETURN json_build_object('success', false, 'message', 'Invalid or already used key');
        END IF;
        
        -- If credits not set, assign based on key type
        IF v_credits IS NULL OR v_credits = 0 THEN
          CASE v_key_type
            WHEN 'BASIC' THEN v_credits := 10;
            WHEN 'STANDARD' THEN v_credits := 25;
            WHEN 'PREMIUM' THEN v_credits := 50;
            WHEN 'UNLIMITED' THEN v_credits := 100;
            ELSE v_credits := 5;
          END CASE;
        END IF;
        
        -- Begin transaction
        BEGIN
          -- Mark key as used
          UPDATE api_keys
          SET used_by = p_user_id, used_at = CURRENT_TIMESTAMP
          WHERE key_value = p_key_value;
          
          -- Add credits to user
          INSERT INTO user_credits (user_id, total_credits, used_credits)
          VALUES (p_user_id, v_credits, 0)
          ON CONFLICT (user_id)
          DO UPDATE SET 
            total_credits = user_credits.total_credits + v_credits,
            last_updated = CURRENT_TIMESTAMP;
          
          -- Record transaction
          INSERT INTO credit_transactions (user_id, key_value, credits_amount, transaction_type)
          VALUES (p_user_id, p_key_value, v_credits, 'REDEEM');
          
          -- Return success
          RETURN json_build_object(
            'success', true, 
            'message', 'Key redeemed successfully', 
            'credits_added', v_credits,
            'key_type', v_key_type
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE;
        END;
      END;
      $$;
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("Error setting up key system:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Key system setup successfully" })
  } catch (error: any) {
    console.error("Unexpected error setting up key system:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
