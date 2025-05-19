"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, ExternalLink, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientSupabase } from "@/utils/supabase"

export default function PreviewSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  const handleSetupCredits = async () => {
    try {
      setIsLoading(true)
      setResult(null)
      setLogs([])

      addLog("Starting preview credit system setup...")

      // Create a client-side Supabase client
      addLog("Creating Supabase client")
      const supabase = createClientSupabase()

      // Check connection
      addLog("Testing database connection")
      const { data: testData, error: testError } = await supabase
        .from("api_keys")
        .select("count(*)", { count: "exact", head: true })

      if (testError) {
        addLog(`Connection test failed: ${testError.message}`)
        throw new Error(`Database connection failed: ${testError.message}`)
      }

      addLog("Database connection successful")

      // Create tables
      addLog("Creating tables")
      const createTablesQuery = `
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
      `

      // Execute the query
      const { error: createError } = await supabase.rpc("exec_sql", {
        sql_query: createTablesQuery,
      })

      if (createError) {
        addLog(`Error creating tables: ${createError.message}`)
        throw new Error(`Failed to create tables: ${createError.message}`)
      }

      addLog("Tables created successfully")

      // Add columns to api_keys table
      addLog("Adding columns to api_keys table")
      const alterTableQuery = `
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
      `

      const { error: alterError } = await supabase.rpc("exec_sql", {
        sql_query: alterTableQuery,
      })

      if (alterError) {
        addLog(`Error altering table: ${alterError.message}`)
        throw new Error(`Failed to alter table: ${alterError.message}`)
      }

      addLog("Table alterations successful")

      // Update existing keys with credit values
      addLog("Updating existing keys with credit values")
      const updateKeysQuery = `
        UPDATE api_keys SET credit_value = 
          CASE 
            WHEN key_type = 'BASIC' THEN 10
            WHEN key_type = 'STANDARD' THEN 25
            WHEN key_type = 'PREMIUM' THEN 50
            WHEN key_type = 'UNLIMITED' THEN 100
            ELSE 0
          END
        WHERE credit_value = 0;
      `

      const { error: updateError } = await supabase.rpc("exec_sql", {
        sql_query: updateKeysQuery,
      })

      if (updateError) {
        addLog(`Error updating keys: ${updateError.message}`)
        throw new Error(`Failed to update keys: ${updateError.message}`)
      }

      addLog("Keys updated successfully")

      // Create redeem_key function
      addLog("Creating redeem_key function")
      const createFunctionQuery = `
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
      `

      const { error: functionError } = await supabase.rpc("exec_sql", {
        sql_query: createFunctionQuery,
      })

      if (functionError) {
        addLog(`Error creating function: ${functionError.message}`)
        throw new Error(`Failed to create function: ${functionError.message}`)
      }

      addLog("Function created successfully")
      addLog("Credit system setup completed successfully")

      setResult({
        success: true,
        message: "Credit system set up successfully in preview mode",
      })
    } catch (error) {
      console.error("Error setting up credit system:", error)
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setResult({
        success: false,
        message: `Error setting up credit system: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackClick = () => {
    router.push("/admin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-800 to-indigo-900 border-b border-blue-700/50 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={handleBackClick} className="text-blue-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              Preview Environment Setup
            </CardTitle>
            <div className="w-5"></div> {/* Empty div for alignment */}
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-4">
          <div className="mb-6 p-3 bg-blue-900/20 border border-blue-700/30 rounded-md">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-blue-400 font-medium">Preview Environment Setup</h3>
                <p className="text-blue-300/80 text-sm mt-1">
                  This page is specifically designed for setting up the credit system in Vercel Preview environments. It
                  uses client-side operations with special handling for preview deployments.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-gray-400 mb-6">
              Click the button below to set up the credit system in this preview environment. This will create all
              necessary database tables and functions.
            </p>

            <Button
              onClick={handleSetupCredits}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-8 py-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Setting Up...
                </>
              ) : (
                "Set Up Preview Credit System"
              )}
            </Button>

            {result && (
              <div
                className={`mt-6 p-4 rounded-md ${
                  result.success
                    ? "bg-green-900/20 border border-green-900/30"
                    : "bg-red-900/20 border border-red-900/30"
                }`}
              >
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mr-2" />
                  )}
                  <p className={result.success ? "text-green-400" : "text-red-400"}>{result.message}</p>
                </div>
              </div>
            )}

            {logs.length > 0 && (
              <div className="mt-6 text-left">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Setup Logs:</h3>
                <div className="bg-black/50 border border-gray-800 rounded-md p-3 max-h-60 overflow-y-auto text-xs font-mono">
                  {logs.map((log, index) => (
                    <div key={index} className="text-gray-400 mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-blue-900/30 pt-4">
              <Link
                href="https://t.me/fansignpreviews"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Check out our previews on Telegram
              </Link>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-black/60 border-t border-blue-900/30 pt-4">
          <div className="w-full text-center text-xs text-gray-500">
            Admin Panel • Preview Credit System Setup • {new Date().toLocaleDateString()}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
