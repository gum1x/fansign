import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase"

export async function GET(request: Request) {
  try {
    // Get the user ID from the URL
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
          credits: 0,
        },
        { status: 400 },
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Check if user exists in the database
    const { data: userData, error: userError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single()

    if (userError) {
      // If user doesn't exist, create a new user with 0 credits
      if (userError.code === "PGRST116") {
        // Record not found
        const { error: insertError } = await supabase.from("user_credits").insert({ user_id: userId, credits: 0 })

        if (insertError) {
          console.error(`Error creating new user:`, insertError)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to create user",
              credits: 0,
            },
            { status: 500 },
          )
        }

        // Return 0 credits for new user
        return NextResponse.json(
          {
            success: true,
            credits: 0,
            message: "New user created with 0 credits",
          },
          {
            headers: {
              "Cache-Control": "no-store, max-age=0",
            },
          },
        )
      }

      console.error(`Error fetching user:`, userError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch user credits",
          credits: 0,
        },
        { status: 500 },
      )
    }

    // Return the user's credits
    return NextResponse.json(
      {
        success: true,
        credits: userData.credits,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error: any) {
    console.error(`Unhandled error in user-credits API:`, error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
        credits: 0,
      },
      { status: 500 },
    )
  }
}
