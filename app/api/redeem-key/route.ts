import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId, keyCode } = await request.json()

    if (!userId || !keyCode) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID and key code are required",
        },
        { status: 400 },
      )
    }

    const supabase = createClient()

    // Call the redeem_key function
    const { data, error } = await supabase.rpc("redeem_key", {
      p_user_id: userId,
      p_key_code: keyCode,
    })

    if (error) {
      console.error("Error redeeming key:", error)

      // Return a user-friendly error message
      return NextResponse.json({
        success: false,
        message: "Failed to redeem key. Please try again later.",
        debug: error.message,
      })
    }

    // Return the result directly
    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error in redeem-key API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
