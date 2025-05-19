"use server"

import { createServerSupabase } from "@/utils/supabase"
import { revalidatePath } from "next/cache"

// Type definitions
export interface SupportMessage {
  id: string
  user_id: string
  message: string
  is_from_admin: boolean
  is_read: boolean
  parent_message_id: string | null
  created_at: string
}

// Create a new support message
export async function createSupportMessage(userId: string, message: string, parentMessageId?: string) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from("support_messages")
      .insert({
        user_id: userId,
        message,
        is_from_admin: false,
        is_read: false,
        parent_message_id: parentMessageId || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating support message:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/support")
    return { success: true, message: data }
  } catch (error) {
    console.error("Error in createSupportMessage:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Get support messages for a user
export async function getUserSupportMessages(userId: string) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching support messages:", error)
      return { success: false, error: error.message, messages: [] }
    }

    return { success: true, messages: data as SupportMessage[] }
  } catch (error) {
    console.error("Error in getUserSupportMessages:", error)
    return { success: false, error: error.message || "An unexpected error occurred", messages: [] }
  }
}

// Mark message as read
export async function markMessageAsRead(messageId: string) {
  try {
    const supabase = createServerSupabase()

    const { error } = await supabase.from("support_messages").update({ is_read: true }).eq("id", messageId)

    if (error) {
      console.error("Error marking message as read:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/support")
    return { success: true }
  } catch (error) {
    console.error("Error in markMessageAsRead:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Admin: Get all support messages grouped by user
export async function getAllSupportMessages() {
  try {
    const supabase = createServerSupabase()

    // Get all support messages
    const { data: allMessages, error: messagesError } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500) // Limit to prevent excessive data fetching

    if (messagesError) {
      console.error("Error fetching support messages:", messagesError)
      return { success: false, error: messagesError.message, userMessages: [] }
    }

    // Group messages by user_id and find unique users
    const userIds = new Set()
    const uniqueUsers = []

    for (const message of allMessages) {
      if (!userIds.has(message.user_id)) {
        userIds.add(message.user_id)
        uniqueUsers.push({ user_id: message.user_id })
      }
    }

    // For each unique user, get their messages
    const userMessages = []

    for (const user of uniqueUsers) {
      // Filter messages for this user from the already fetched messages
      const userMessagesData = allMessages
        .filter((msg) => msg.user_id === user.user_id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      // Get user info
      const { data: userInfo, error: userError } = await supabase
        .from("telegram_users")
        .select("*")
        .eq("id", user.user_id)
        .single()

      // Check for unread messages from the user (not from admin)
      const hasUnread = userMessagesData.some((msg) => !msg.is_read && !msg.is_from_admin)

      userMessages.push({
        userId: user.user_id,
        userInfo: userError ? null : userInfo,
        messages: userMessagesData as SupportMessage[],
        hasUnread: hasUnread,
      })
    }

    return { success: true, userMessages }
  } catch (error) {
    console.error("Error in getAllSupportMessages:", error)
    return { success: false, error: error.message || "An unexpected error occurred", userMessages: [] }
  }
}

// Admin: Reply to a support message
export async function adminReplySupportMessage(userId: string, message: string, parentMessageId?: string) {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from("support_messages")
      .insert({
        user_id: userId,
        message,
        is_from_admin: true,
        is_read: false,
        parent_message_id: parentMessageId || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating admin reply:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/support")
    return { success: true, message: data }
  } catch (error) {
    console.error("Error in adminReplySupportMessage:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Check if user has unread messages
export async function checkUnreadMessages(userId: string) {
  try {
    const supabase = createServerSupabase()

    const { count, error } = await supabase
      .from("support_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_from_admin", true)
      .eq("is_read", false)

    if (error) {
      console.error("Error checking unread messages:", error)
      return { success: false, error: error.message, hasUnread: false }
    }

    return { success: true, hasUnread: count > 0, count }
  } catch (error) {
    console.error("Error in checkUnreadMessages:", error)
    return { success: false, error: error.message || "An unexpected error occurred", hasUnread: false }
  }
}
