"use server"

import { createServerSupabase } from "@/utils/supabase"

// Debug-focused key redemption with exhaustive logging
export async function deepDebugKeyRedeem(userId: string, keyCode: string, diagnosticData: any) {
  // Server-side logs array
  const logs: string[] = []

  function log(message: string) {
    logs.push(`[${new Date().toISOString()}] ${message}`)
    console.log(`DEBUG: ${message}`)
  }

  log(`Starting deep debug key redemption for user ${userId}, key ${keyCode}`)
  log(`Received diagnostic data: ${JSON.stringify(diagnosticData)}`)

  try {
    // Input validation with detailed logging
    if (!userId) {
      log("ERROR: Missing userId")
      return {
        success: false,
        message: "User ID is required",
        logs,
        diagnosticData,
      }
    }

    if (!keyCode) {
      log("ERROR: Missing keyCode")
      return {
        success: false,
        message: "Key code is required",
        logs,
        diagnosticData,
      }
    }

    // Clean up the key code
    const cleanKeyCode = keyCode.trim().toUpperCase()
    log(`Cleaned key code: ${cleanKeyCode}`)

    // Initialize Supabase with detailed error handling
    let supabase
    try {
      log("Initializing Supabase client")
      supabase = createServerSupabase()
      log("Supabase client initialized successfully")
    } catch (error) {
      log(`CRITICAL ERROR: Failed to initialize Supabase: ${error}`)
      return {
        success: false,
        message: "Failed to connect to the database",
        error: String(error),
        logs,
        diagnosticData,
      }
    }

    // Check database connection and tables
    const databaseCheck = await checkDatabaseConnection()
    if (!databaseCheck.connected) {
      log(`Database connection check failed: ${databaseCheck.message}`)
      return {
        success: false,
        message: "Database connection check failed",
        error: databaseCheck.error,
        logs,
        diagnosticData,
      }
    }

    log(`Database connection check passed: ${JSON.stringify(databaseCheck.tables)}`)

    // STEP 1: Check if the key exists
    log("STEP 1: Checking if key exists in database")
    let keyData
    try {
      const { data, error } = await supabase.from("api_keys").select("*").eq("key_code", cleanKeyCode).maybeSingle()

      if (error) {
        log(`ERROR querying key: ${error.message}`)
        throw error
      }

      if (!data) {
        log(`Key not found: ${cleanKeyCode}`)
        return {
          success: false,
          message: "Invalid key code. This key does not exist.",
          logs,
          diagnosticData,
        }
      }

      keyData = data
      log(`Key found: ${JSON.stringify(keyData)}`)
    } catch (error) {
      log(`STEP 1 ERROR: ${error}`)
      return {
        success: false,
        message: "Error checking key validity",
        error: String(error),
        step: 1,
        logs,
        diagnosticData,
      }
    }

    // STEP 2: Check if key is valid (not used or expired)
    log("STEP 2: Checking if key is valid (not used or expired)")
    try {
      if (keyData.used_by) {
        log(`Key already used by user: ${keyData.used_by}`)
        return {
          success: false,
          message: "This key has already been used",
          logs,
          keyData,
          diagnosticData,
        }
      }

      if (!keyData.is_active) {
        log(`Key is inactive: ${keyData.key_code}`)
        return {
          success: false,
          message: "This key is inactive or has expired",
          logs,
          keyData,
          diagnosticData,
        }
      }

      log("Key is valid and unused")
    } catch (error) {
      log(`STEP 2 ERROR: ${error}`)
      return {
        success: false,
        message: "Error checking key status",
        error: String(error),
        step: 2,
        logs,
        diagnosticData,
      }
    }

    // STEP 3: Determine credits to add based on key tier
    log("STEP 3: Determining credits to add based on key tier")
    let creditsToAdd = 0
    try {
      switch (keyData.tier) {
        case "BASIC":
          creditsToAdd = 10
          break
        case "STANDARD":
          creditsToAdd = 25
          break
        case "PREMIUM":
          creditsToAdd = 50
          break
        case "UNLIMITED":
          creditsToAdd = 100
          break
        default:
          creditsToAdd = 5 // Default fallback
      }
      log(`Credits to add determined: ${creditsToAdd} based on tier: ${keyData.tier}`)
    } catch (error) {
      log(`STEP 3 ERROR: ${error}`)
      return {
        success: false,
        message: "Error determining credit amount",
        error: String(error),
        step: 3,
        logs,
        diagnosticData,
      }
    }

    // STEP 4: Get current user credits
    log("STEP 4: Getting current user credits")
    let currentCredits = 0
    try {
      const { data: userData, error: userError } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", userId)
        .maybeSingle()

      if (userError) {
        log(`Error querying user credits: ${userError.message}`)
        // Don't fail, we'll create the record if it doesn't exist
      }

      currentCredits = userData?.credits || 0
      log(`Current user credits: ${currentCredits}`)
    } catch (error) {
      log(`STEP 4 ERROR: ${error}`)
      // Don't fail, we'll try to create the user record
      log("Will attempt to create new user credits record")
    }

    // STEP 5: Update/Create user credits
    log("STEP 5: Updating user credits")
    let newTotalCredits = 0
    try {
      newTotalCredits = currentCredits + creditsToAdd
      log(`New total credits will be: ${newTotalCredits}`)

      // Use upsert to create or update the record
      const { error: updateError } = await supabase.from("user_credits").upsert({
        user_id: userId,
        credits: newTotalCredits,
        updated_at: new Date().toISOString(),
      })

      if (updateError) {
        log(`ERROR updating user credits: ${updateError.message}`)
        throw updateError
      }

      log("User credits updated successfully")
    } catch (error) {
      log(`STEP 5 ERROR: ${error}`)
      return {
        success: false,
        message: "Failed to update user credits",
        error: String(error),
        step: 5,
        logs,
        diagnosticData,
      }
    }

    // STEP 6: Mark the key as used
    log("STEP 6: Marking key as used")
    try {
      const { error: keyUpdateError } = await supabase
        .from("api_keys")
        .update({
          used_by: userId,
          used_at: new Date().toISOString(),
        })
        .eq("key_code", cleanKeyCode)

      if (keyUpdateError) {
        log(`ERROR marking key as used: ${keyUpdateError.message}`)
        // Non-critical error, continue but log it
        log("WARNING: Key marked as used in user credits but not in api_keys table")
      } else {
        log("Key marked as used successfully")
      }
    } catch (error) {
      log(`STEP 6 WARNING: ${error}`)
      // Non-critical error, continue
      log("WARNING: Proceeding despite error marking key as used")
    }

    // STEP 7: Record the transaction
    log("STEP 7: Recording transaction")
    try {
      const { error: transactionError } = await supabase.from("credit_transactions").insert({
        user_id: userId,
        amount: creditsToAdd,
        transaction_type: "KEY_REDEMPTION",
        description: `Redeemed ${keyData.tier} key: ${cleanKeyCode}`,
        created_at: new Date().toISOString(),
      })

      if (transactionError) {
        log(`ERROR recording transaction: ${transactionError.message}`)
        // Non-critical error, continue but log it
        log("WARNING: Transaction not recorded but credits were added")
      } else {
        log("Transaction recorded successfully")
      }
    } catch (error) {
      log(`STEP 7 WARNING: ${error}`)
      // Non-critical error, continue
      log("WARNING: Proceeding despite error recording transaction")
    }

    // STEP 8: Verify final state
    log("STEP 8: Verifying final state")
    try {
      // Check user credits to confirm update
      const { data: finalUserData, error: finalUserError } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", userId)
        .single()

      if (finalUserError) {
        log(`ERROR verifying final user credits: ${finalUserError.message}`)
        // Not fatal, but concerning
        log("WARNING: Could not verify final credit balance")
      } else {
        log(`Final user credits: ${finalUserData.credits}`)
        if (finalUserData.credits !== newTotalCredits) {
          log(`WARNING: Credit mismatch. Expected ${newTotalCredits}, found ${finalUserData.credits}`)
        } else {
          log("Credit balance verified correctly")
        }
      }

      // Check key status to confirm update
      const { data: finalKeyData, error: finalKeyError } = await supabase
        .from("api_keys")
        .select("used_by, used_at")
        .eq("key_code", cleanKeyCode)
        .single()

      if (finalKeyError) {
        log(`ERROR verifying final key status: ${finalKeyError.message}`)
        // Not fatal, but concerning
        log("WARNING: Could not verify final key status")
      } else {
        log(`Final key status: ${JSON.stringify(finalKeyData)}`)
        if (finalKeyData.used_by !== userId) {
          log(`WARNING: Key user mismatch. Expected ${userId}, found ${finalKeyData.used_by}`)
        } else {
          log("Key status verified correctly")
        }
      }
    } catch (error) {
      log(`STEP 8 WARNING: ${error}`)
      // Non-critical error, continue
      log("WARNING: Could not fully verify final state")
    }

    // SUCCESS - Return all diagnostic information
    log("SUCCESS: Key redeemed successfully")
    return {
      success: true,
      message: `Successfully redeemed ${keyData.tier} key!`,
      creditsAdded: creditsToAdd,
      newTotalCredits,
      keyType: keyData.tier,
      logs,
      diagnosticData,
    }
  } catch (error) {
    // Catch-all for unexpected errors
    log(`CRITICAL ERROR: Unhandled exception: ${error}`)
    return {
      success: false,
      message: "An unexpected error occurred",
      error: String(error),
      logs,
      diagnosticData,
    }
  }
}

// Check database connection and tables with improved error handling
export async function checkDatabaseConnection() {
  try {
    console.log("Starting database connection check")

    // Check environment variables first
    const envVars = {
      SUPABASE_URL: process.env.SUPABASE_URL ? "Set" : "Missing",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "Set" : "Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing",
    }

    console.log("Environment variables check:", envVars)

    // Check if required environment variables are missing
    if (
      (envVars.SUPABASE_URL === "Missing" && envVars.NEXT_PUBLIC_SUPABASE_URL === "Missing") ||
      (envVars.SUPABASE_ANON_KEY === "Missing" &&
        envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY === "Missing" &&
        envVars.SUPABASE_SERVICE_ROLE_KEY === "Missing")
    ) {
      return {
        connected: false,
        message: "Required Supabase environment variables are missing",
        environment: envVars,
        timestamp: new Date().toISOString(),
      }
    }

    // Try to initialize Supabase client
    let supabase
    try {
      supabase = createServerSupabase()
      console.log("Supabase client initialized")
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      return {
        connected: false,
        message: `Failed to initialize Supabase client: ${error}`,
        environment: envVars,
        timestamp: new Date().toISOString(),
      }
    }

    // Initialize tables object
    const tables = {
      api_keys: { exists: false, count: 0 },
      user_credits: { exists: false, count: 0 },
      credit_transactions: { exists: false, count: 0 },
    }

    // Test connection with a simple query
    try {
      console.log("Testing connection with simple query")
      const { data, error } = await supabase.from("api_keys").select("count(*)", { count: "exact", head: true })

      if (error) {
        throw error
      }

      console.log("Connection test successful")
    } catch (error) {
      console.error("Connection test failed:", error)
      return {
        connected: false,
        message: `Connection test failed: ${error.message || String(error)}`,
        error: error.message || String(error),
        environment: envVars,
        timestamp: new Date().toISOString(),
      }
    }

    // Check each table individually
    console.log("Checking individual tables")

    // Check api_keys table
    try {
      const { count, error } = await supabase.from("api_keys").select("*", { count: "exact", head: true })

      if (!error) {
        tables.api_keys.exists = true
        tables.api_keys.count = count
        console.log("api_keys table exists with", count, "rows")
      } else {
        console.error("Error checking api_keys table:", error)
      }
    } catch (e) {
      console.error("Exception checking api_keys table:", e)
    }

    // Check user_credits table
    try {
      const { count, error } = await supabase.from("user_credits").select("*", { count: "exact", head: true })

      if (!error) {
        tables.user_credits.exists = true
        tables.user_credits.count = count
        console.log("user_credits table exists with", count, "rows")
      } else {
        console.error("Error checking user_credits table:", error)
      }
    } catch (e) {
      console.error("Exception checking user_credits table:", e)
    }

    // Check credit_transactions table
    try {
      const { count, error } = await supabase.from("credit_transactions").select("*", { count: "exact", head: true })

      if (!error) {
        tables.credit_transactions.exists = true
        tables.credit_transactions.count = count
        console.log("credit_transactions table exists with", count, "rows")
      } else {
        console.error("Error checking credit_transactions table:", error)
      }
    } catch (e) {
      console.error("Exception checking credit_transactions table:", e)
    }

    // Return successful result
    return {
      connected: true,
      tables,
      environment: envVars,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    // Catch-all for any unexpected errors
    console.error("Unexpected error in database check:", error)
    return {
      connected: false,
      message: `Unexpected error: ${error.message || String(error)}`,
      error: error.message || String(error),
      timestamp: new Date().toISOString(),
    }
  }
}
