"use server"
import { createServerSupabase } from "@/utils/supabase"

export async function checkAllPendingDeposits() {
  try {
    const supabase = createServerSupabase()

    // Fetch all pending deposits
    const { data: pendingDeposits, error: pendingError } = await supabase
      .from("transactions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })

    if (pendingError) {
      console.error("Error fetching pending deposits:", pendingError)
      return { success: false, error: pendingError.message }
    }

    // Simulate checking each deposit and updating its status
    const updatedDeposits = []
    for (const deposit of pendingDeposits) {
      // Simulate checking the deposit status
      const isConfirmed = Math.random() > 0.2 // 80% chance of success

      // Update the deposit status
      const newStatus = isConfirmed ? "completed" : "cancelled"
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: newStatus })
        .eq("id", deposit.id)

      if (updateError) {
        console.error(`Error updating deposit ${deposit.id}:`, updateError)
        continue // Skip to the next deposit
      }

      updatedDeposits.push({ ...deposit, status: newStatus })
    }

    return { success: true, result: updatedDeposits }
  } catch (error) {
    console.error("Error in checkAllPendingDeposits:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
