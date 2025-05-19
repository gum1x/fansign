"use server"

// Helper function to create a transaction with the correct column
async function createTransaction(supabase, transactionData, description) {
  try {
    // First, try with just the message column
    const basicData = {
      ...transactionData,
      message: description,
    }

    const { error: messageError } = await supabase.from("transactions").insert(basicData)

    if (!messageError) {
      return { success: true }
    }

    // If that failed, try with just the details column
    if (messageError.message.includes("message")) {
      const detailsData = {
        ...transactionData,
        details: description,
      }

      const { error: detailsError } = await supabase.from("transactions").insert(detailsData)

      if (!detailsError) {
        return { success: true }
      }

      // If both failed, try without either column
      if (detailsError.message.includes("details")) {
        const minimalData = { ...transactionData }
        const { error: minimalError } = await supabase.from("transactions").insert(minimalData)

        if (!minimalError) {
          return { success: true }
        }

        return { success: false, error: `Failed to create transaction: ${minimalError.message}` }
      }

      return { success: false, error: `Failed to create transaction: ${detailsError.message}` }
    }

    return { success: false, error: `Failed to create transaction: ${messageError.message}` }
  } catch (error) {
    console.error("Error in createTransaction:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function simpleAddBalance(userId: string, amount: number) {
  // Always return success since the balance system has been removed
  console.log("Balance system removed: Balance add not needed for user", userId)
  return { success: true, message: `Balance operations are disabled - all features are free` }
}

export async function addFiveDollarsToUser() {
  return { success: true, message: "Balance operations are disabled - all features are free" }
}
