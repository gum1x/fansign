import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/utils/supabase"
import { isAdmin } from "@/utils/adminUtils"

export async function GET(request: NextRequest) {
  try {
    // Get the URL parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    // Check if the user is an admin
    if (userId && !(await isAdmin(userId))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabase()

    // Generate 10 keys of each type
    const keyTypes = ["BASIC", "STANDARD", "PREMIUM", "UNLIMITED"]
    const creditValues = [10, 25, 50, 100]

    const keys: { type: string; key: string; credits: number }[] = []

    for (let i = 0; i < keyTypes.length; i++) {
      const keyType = keyTypes[i]
      const creditValue = creditValues[i]

      for (let j = 0; j < 10; j++) {
        // Generate a random key
        const keyValue =
          `${keyType.substring(0, 3)}-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 10)}`.toUpperCase()

        // Insert the key into the database
        const { error } = await supabase
          .from("api_keys")
          .insert({ key_value: keyValue, key_type: keyType, credits: creditValue })

        if (error) {
          console.error(`Error inserting key ${keyValue}:`, error)
          continue
        }

        keys.push({ type: keyType, key: keyValue, credits: creditValue })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${keys.length} keys successfully`,
      keys,
    })
  } catch (error: any) {
    console.error("Unexpected error generating initial keys:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
