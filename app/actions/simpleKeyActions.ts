"use server"

import { deepDebugKeyRedeem } from "./debugKeyActions"

// Simplified wrapper around the debug function
export async function redeemKeyWithRetry(userId: string, keyCode: string) {
  console.log(`Simple key redemption for user ${userId}, key ${keyCode}`)

  try {
    // Call the deep debug function with minimal diagnostic data
    const diagnosticData = {
      source: "simpleKeyActions",
      timestamp: new Date().toISOString(),
    }

    const result = await deepDebugKeyRedeem(userId, keyCode, diagnosticData)

    // Return a simplified version of the result
    return {
      success: result.success,
      message: result.message,
      creditsAdded: result.creditsAdded,
      newTotalCredits: result.newTotalCredits,
    }
  } catch (error) {
    console.error("Error in redeemKeyWithRetry:", error)
    return {
      success: false,
      message: "Failed to redeem key. Please try again or contact support.",
    }
  }
}
