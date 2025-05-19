import { type NextRequest, NextResponse } from "next/server"
import { verifyApiKey, recordKeyUsage, isFeatureAvailable } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get API key from query params or authorization header
    const apiKey =
      request.nextUrl.searchParams.get("key") || request.headers.get("authorization")?.replace("Bearer ", "") || ""

    if (!apiKey) {
      return NextResponse.json({ error: "No API key provided" }, { status: 400 })
    }

    // Verify the API key
    const keyVerification = await verifyApiKey(apiKey)

    if (!keyVerification.valid) {
      return NextResponse.json({ error: "Invalid or expired API key" }, { status: 401 })
    }

    // Check if the key has reached its daily limit
    if (
      keyVerification.remainingDaily !== null &&
      keyVerification.remainingDaily !== undefined &&
      keyVerification.remainingDaily !== -1 &&
      keyVerification.remainingDaily <= 0
    ) {
      return NextResponse.json({ error: "Daily usage limit reached" }, { status: 429 })
    }

    // Check if the key has reached its monthly limit
    if (
      keyVerification.remainingMonthly !== null &&
      keyVerification.remainingMonthly !== undefined &&
      keyVerification.remainingMonthly !== -1 &&
      keyVerification.remainingMonthly <= 0
    ) {
      return NextResponse.json({ error: "Monthly usage limit reached" }, { status: 429 })
    }

    // Check if the feature is available for this plan
    const feature = request.nextUrl.searchParams.get("feature") || "basic_generation"
    if (keyVerification.plan && !isFeatureAvailable(keyVerification.plan, feature)) {
      return NextResponse.json(
        {
          error: `The ${feature} feature is not available on your ${keyVerification.plan} plan`,
        },
        { status: 403 },
      )
    }

    // Record the API usage
    await recordKeyUsage(apiKey)

    // Process the search query
    const query = request.nextUrl.searchParams.get("q") || ""

    // This is a placeholder for actual search functionality
    // In a real implementation, you would perform the search here
    const results = {
      query,
      results: [
        { id: 1, title: "Result 1", description: "Description for result 1" },
        { id: 2, title: "Result 2", description: "Description for result 2" },
      ],
      plan: keyVerification.plan,
      remainingDaily: keyVerification.remainingDaily !== -1 ? keyVerification.remainingDaily - 1 : -1,
      remainingMonthly: keyVerification.remainingMonthly !== -1 ? keyVerification.remainingMonthly - 1 : -1,
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error processing search:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
