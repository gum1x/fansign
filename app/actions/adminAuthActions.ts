"use server"

import { isAdmin } from "@/utils/adminUtils"

export async function executeAdminQuery(query: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/execute-sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        token: process.env.ADMIN_SECRET_KEY, // Use server-side env variable
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to execute query")
    }

    return { success: true, result: data.result }
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function checkAdminStatus(userId: string | number) {
  return isAdmin(userId)
}
