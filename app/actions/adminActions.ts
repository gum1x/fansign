"use server"

import { createServerSupabase } from "@/utils/supabase"
import { isAdmin } from "@/utils/adminUtils"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function updateSystemSetting(formData: FormData) {
  const cookieStore = cookies()

  try {
    const supabase = createServerSupabase()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !isAdmin(user.id)) {
      return { success: false, message: "Unauthorized" }
    }

    const key = formData.get("key") as string
    const value = formData.get("value") as string

    if (!key || !value) {
      return { success: false, message: "Key and value are required" }
    }

    const { error } = await supabase
      .from("system_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() })

    if (error) throw error

    return { success: true, message: `Setting ${key} updated successfully` }
  } catch (error) {
    console.error("Error updating system setting:", error)
    return {
      success: false,
      message: `Failed to update system setting: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function setupCreditSystem(isPreview = false) {
  const logs: string[] = []

  try {
    logs.push("Starting credit system setup")

    // Special handling for preview environment
    if (isPreview) {
      logs.push("Preview mode detected - using preview-specific authentication")

      // In preview mode, we'll skip some authentication checks
      logs.push("Creating Supabase client for preview environment")

      try {
        // Create Supabase client with error handling
        const supabase = createServerSupabase()
        logs.push("Supabase client created successfully")

        // Execute SQL directly with detailed error handling
        logs.push("Executing SQL to create tables and functions")

        try {
          // Create user_credits table if it doesn't exist
          logs.push("Creating user_credits and credit_transactions tables")
          const { error: createTableError } = await supabase.rpc("exec_sql", {
            sql_query: `
              CREATE TABLE IF NOT EXISTS user_credits (
                user_id BIGINT PRIMARY KEY,
                total_credits INTEGER NOT NULL DEFAULT 0,
                used_credits INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
              
              CREATE TABLE IF NOT EXISTS credit_transactions (
                id SERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL,
                amount INTEGER NOT NULL,
                transaction_type TEXT NOT NULL,
                key_id TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
              
              -- Add columns to api_keys table if they don't exist
              DO $$
              BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'used_by') THEN
                  ALTER TABLE api_keys ADD COLUMN used_by BIGINT;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'used_at') THEN
                  ALTER TABLE api_keys ADD COLUMN used_at TIMESTAMP WITH TIME ZONE;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'credit_value') THEN
                  ALTER TABLE api_keys ADD COLUMN credit_value INTEGER NOT NULL DEFAULT 0;
                END IF;
              END $$;
              
              -- Update existing keys with credit values based on key type
              UPDATE api_keys SET credit_value = 
                CASE 
                  WHEN key_type = 'BASIC' THEN 10
                  WHEN key_type = 'STANDARD' THEN 25
                  WHEN key_type = 'PREMIUM' THEN 50
                  WHEN key_type = 'UNLIMITED' THEN 100
                  ELSE 0
                END
              WHERE credit_value = 0;
            `,
          })

          if (createTableError) {
            logs.push(`Error creating tables: ${createTableError.message}`)
            console.error("Error creating tables:", createTableError)

            // Try direct SQL as fallback
            logs.push("Attempting direct SQL as fallback")
            try {
              // Direct SQL execution as fallback
              const { data, error } = await supabase.from("dummy_table").select("*").limit(1)
              logs.push(`Direct SQL test result: ${error ? "Failed" : "Success"}`)

              if (error) {
                logs.push(`Direct SQL error: ${error.message}`)
                return {
                  success: false,
                  message: "Database connection failed. Please check your environment variables.",
                  logs,
                }
              }
            } catch (directError) {
              logs.push(
                `Direct SQL fallback error: ${directError instanceof Error ? directError.message : String(directError)}`,
              )
            }

            return {
              success: false,
              message: `Failed to create tables: ${createTableError.message}`,
              logs,
            }
          }

          logs.push("Tables created successfully")

          // Create function to redeem key and add credits
          logs.push("Creating redeem_key function")
          const { error: functionError } = await supabase.rpc("exec_sql", {
            sql_query: `
              CREATE OR REPLACE FUNCTION redeem_key(p_key_id TEXT, p_user_id BIGINT)
              RETURNS TABLE(success BOOLEAN, message TEXT, credits_added INTEGER, total_credits INTEGER) AS $$
              DECLARE
                v_key_exists BOOLEAN;
                v_key_used BOOLEAN;
                v_credit_value INTEGER;
                v_user_exists BOOLEAN;
              BEGIN
                -- Check if key exists
                SELECT EXISTS(SELECT 1 FROM api_keys WHERE key_id = p_key_id) INTO v_key_exists;
                
                IF NOT v_key_exists THEN
                  RETURN QUERY SELECT FALSE, 'Invalid key', 0, 0;
                  RETURN;
                END IF;
                
                -- Check if key is already used
                SELECT used_by IS NOT NULL INTO v_key_used FROM api_keys WHERE key_id = p_key_id;
                
                IF v_key_used THEN
                  RETURN QUERY SELECT FALSE, 'Key already used', 0, 0;
                  RETURN;
                END IF;
                
                -- Get credit value for this key
                SELECT credit_value INTO v_credit_value FROM api_keys WHERE key_id = p_key_id;
                
                -- Check if user exists in user_credits
                SELECT EXISTS(SELECT 1 FROM user_credits WHERE user_id = p_user_id) INTO v_user_exists;
                
                -- Begin transaction
                BEGIN
                  -- If user doesn't exist, create a record
                  IF NOT v_user_exists THEN
                    INSERT INTO user_credits (user_id, total_credits, used_credits)
                    VALUES (p_user_id, v_credit_value, 0);
                  ELSE
                    -- Update user credits
                    UPDATE user_credits
                    SET total_credits = total_credits + v_credit_value,
                        updated_at = NOW()
                    WHERE user_id = p_user_id;
                  END IF;
                  
                  -- Mark key as used
                  UPDATE api_keys
                  SET used_by = p_user_id,
                      used_at = NOW()
                  WHERE key_id = p_key_id;
                  
                  -- Record transaction
                  INSERT INTO credit_transactions (user_id, amount, transaction_type, key_id)
                  VALUES (p_user_id, v_credit_value, 'KEY_REDEMPTION', p_key_id);
                  
                  -- Return success
                  RETURN QUERY 
                    SELECT TRUE, 'Key redeemed successfully', 
                           v_credit_value, 
                           (SELECT total_credits FROM user_credits WHERE user_id = p_user_id);
                END;
              END;
              $$ LANGUAGE plpgsql;
            `,
          })

          if (functionError) {
            logs.push(`Error creating function: ${functionError.message}`)
            console.error("Error creating function:", functionError)
            return {
              success: false,
              message: `Failed to create function: ${functionError.message}`,
              logs,
            }
          }

          logs.push("Function created successfully")

          return {
            success: true,
            message: "Credit system set up successfully in preview mode",
            logs,
          }
        } catch (sqlError) {
          logs.push(`SQL execution error: ${sqlError instanceof Error ? sqlError.message : String(sqlError)}`)
          console.error("SQL execution error:", sqlError)
          return {
            success: false,
            message: `SQL execution error: ${sqlError instanceof Error ? sqlError.message : String(sqlError)}`,
            logs,
          }
        }
      } catch (supabaseError) {
        logs.push(
          `Supabase client error: ${supabaseError instanceof Error ? supabaseError.message : String(supabaseError)}`,
        )
        console.error("Supabase client error:", supabaseError)
        return {
          success: false,
          message: `Supabase client error: ${supabaseError instanceof Error ? supabaseError.message : String(supabaseError)}`,
          logs,
        }
      }
    }

    // Standard flow for non-preview environments
    logs.push("Using standard authentication flow")

    // Create Supabase client with error handling
    try {
      const supabase = createServerSupabase()
      logs.push("Supabase client created successfully")

      // Check if user is authenticated and is admin
      logs.push("Checking user authentication")
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        logs.push(`Auth error: ${authError.message}`)
        console.error("Auth error:", authError)
        return {
          success: false,
          message: `Authentication error: ${authError.message}`,
          logs,
        }
      }

      if (!user) {
        logs.push("User not authenticated")
        return {
          success: false,
          message: "User not authenticated. Please log in and try again.",
          logs,
        }
      }

      logs.push(`User authenticated: ${user.id}`)

      if (!isAdmin(user.id)) {
        logs.push(`User ${user.id} is not an admin`)
        return {
          success: false,
          message: "Unauthorized. Only admins can set up the credit system.",
          logs,
        }
      }

      logs.push("Admin status confirmed")

      // Execute SQL directly with detailed error handling
      logs.push("Executing SQL to create tables and functions")

      try {
        // Create user_credits table if it doesn't exist
        logs.push("Creating user_credits and credit_transactions tables")
        const { error: createTableError } = await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS user_credits (
              user_id BIGINT PRIMARY KEY,
              total_credits INTEGER NOT NULL DEFAULT 0,
              used_credits INTEGER NOT NULL DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE TABLE IF NOT EXISTS credit_transactions (
              id SERIAL PRIMARY KEY,
              user_id BIGINT NOT NULL,
              amount INTEGER NOT NULL,
              transaction_type TEXT NOT NULL,
              key_id TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Add columns to api_keys table if they don't exist
            DO $$
            BEGIN
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'used_by') THEN
                ALTER TABLE api_keys ADD COLUMN used_by BIGINT;
              END IF;
              
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'used_at') THEN
                ALTER TABLE api_keys ADD COLUMN used_at TIMESTAMP WITH TIME ZONE;
              END IF;
              
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'credit_value') THEN
                ALTER TABLE api_keys ADD COLUMN credit_value INTEGER NOT NULL DEFAULT 0;
              END IF;
            END $$;
            
            -- Update existing keys with credit values based on key type
            UPDATE api_keys SET credit_value = 
              CASE 
                WHEN key_type = 'BASIC' THEN 10
                WHEN key_type = 'STANDARD' THEN 25
                WHEN key_type = 'PREMIUM' THEN 50
                WHEN key_type = 'UNLIMITED' THEN 100
                ELSE 0
              END
            WHERE credit_value = 0;
          `,
        })

        if (createTableError) {
          logs.push(`Error creating tables: ${createTableError.message}`)
          console.error("Error creating tables:", createTableError)
          return {
            success: false,
            message: `Failed to create tables: ${createTableError.message}`,
            logs,
          }
        }

        logs.push("Tables created successfully")

        // Create function to redeem key and add credits
        logs.push("Creating redeem_key function")
        const { error: functionError } = await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE OR REPLACE FUNCTION redeem_key(p_key_id TEXT, p_user_id BIGINT)
            RETURNS TABLE(success BOOLEAN, message TEXT, credits_added INTEGER, total_credits INTEGER) AS $$
            DECLARE
              v_key_exists BOOLEAN;
              v_key_used BOOLEAN;
              v_credit_value INTEGER;
              v_user_exists BOOLEAN;
            BEGIN
              -- Check if key exists
              SELECT EXISTS(SELECT 1 FROM api_keys WHERE key_id = p_key_id) INTO v_key_exists;
              
              IF NOT v_key_exists THEN
                RETURN QUERY SELECT FALSE, 'Invalid key', 0, 0;
                RETURN;
              END IF;
              
              -- Check if key is already used
              SELECT used_by IS NOT NULL INTO v_key_used FROM api_keys WHERE key_id = p_key_id;
              
              IF v_key_used THEN
                RETURN QUERY SELECT FALSE, 'Key already used', 0, 0;
                RETURN;
              END IF;
              
              -- Get credit value for this key
              SELECT credit_value INTO v_credit_value FROM api_keys WHERE key_id = p_key_id;
              
              -- Check if user exists in user_credits
              SELECT EXISTS(SELECT 1 FROM user_credits WHERE user_id = p_user_id) INTO v_user_exists;
              
              -- Begin transaction
              BEGIN
                -- If user doesn't exist, create a record
                IF NOT v_user_exists THEN
                  INSERT INTO user_credits (user_id, total_credits, used_credits)
                  VALUES (p_user_id, v_credit_value, 0);
                ELSE
                  -- Update user credits
                  UPDATE user_credits
                  SET total_credits = total_credits + v_credit_value,
                      updated_at = NOW()
                  WHERE user_id = p_user_id;
                END IF;
                
                -- Mark key as used
                UPDATE api_keys
                SET used_by = p_user_id,
                    used_at = NOW()
                WHERE key_id = p_key_id;
                
                -- Record transaction
                INSERT INTO credit_transactions (user_id, amount, transaction_type, key_id)
                VALUES (p_user_id, v_credit_value, 'KEY_REDEMPTION', p_key_id);
                
                -- Return success
                RETURN QUERY 
                  SELECT TRUE, 'Key redeemed successfully', 
                         v_credit_value, 
                         (SELECT total_credits FROM user_credits WHERE user_id = p_user_id);
              END;
            END;
            $$ LANGUAGE plpgsql;
          `,
        })

        if (functionError) {
          logs.push(`Error creating function: ${functionError.message}`)
          console.error("Error creating function:", functionError)
          return {
            success: false,
            message: `Failed to create function: ${functionError.message}`,
            logs,
          }
        }

        logs.push("Function created successfully")

        return {
          success: true,
          message: "Credit system set up successfully",
          logs,
        }
      } catch (sqlError) {
        logs.push(`SQL execution error: ${sqlError instanceof Error ? sqlError.message : String(sqlError)}`)
        console.error("SQL execution error:", sqlError)
        return {
          success: false,
          message: `SQL execution error: ${sqlError instanceof Error ? sqlError.message : String(sqlError)}`,
          logs,
        }
      }
    } catch (error) {
      logs.push(`Error setting up credit system: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Error setting up credit system:", error)
      return {
        success: false,
        message: `Failed to set up credit system: ${error instanceof Error ? error.message : String(error)}`,
        logs,
      }
    }
  } catch (outerError) {
    logs.push(`Unexpected error: ${outerError instanceof Error ? outerError.message : String(outerError)}`)
    console.error("Unexpected error in setupCreditSystem:", outerError)
    return {
      success: false,
      message: `Unexpected error: ${outerError instanceof Error ? outerError.message : String(outerError)}`,
      logs,
    }
  }
}

export async function adminAction() {
  try {
    const cookieStore = cookies()
    const supabase = createServerSupabase()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !isAdmin(user.id)) {
      redirect("/admin/unauthorized")
    }

    return { success: true }
  } catch (error) {
    console.error("Admin action error:", error)
    redirect("/admin/unauthorized")
  }
}
