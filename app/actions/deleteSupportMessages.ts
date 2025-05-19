"use server"

import { createServerSupabase } from "@/utils/supabase"
import { revalidatePath } from "next/cache"

// Delete all messages for a specific user
export async function deleteUserSupportMessages(userId: string) {
  try {
    const supabase = createServerSupabase()

    const { error } = await supabase.from("support_messages").delete().eq("user_id", userId)

    if (error) {
      console.error("Error deleting support messages:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/support")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteUserSupportMessages:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Delete a specific message
export async function deleteSupportMessage(messageId: string) {
  try {
    const supabase = createServerSupabase()

    const { error } = await supabase.from("support_messages").delete().eq("id", messageId)

    if (error) {
      console.error("Error deleting support message:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/support")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteSupportMessage:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
