import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase"
import { verifyApiKey } from "@/lib/auth"

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

    // Get the key ID
    const supabase = createClient()
    const { data: keyData, error: keyError } = await supabase.from("api_keys").select("id").eq("key", apiKey).single()

    if (keyError || !keyData) {
      return NextResponse.json({ error: "Failed to retrieve key information" }, { status: 500 })
    }

    // Get usage statistics
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Daily usage
    const { data: dailyUsage, error: dailyError } = await supabase
      .from("api_usage")
      .select("count")
      .eq("key_id", keyData.id)
      .gte("timestamp", startOfDay)

    // Monthly usage
    const { data: monthlyUsage, error: monthlyError } = await supabase
      .from("api_usage")
      .select("count")
      .eq("key_id", keyData.id)
      .gte("timestamp", startOfMonth)

    if (dailyError || monthlyError) {
      return NextResponse.json({ error: "Failed to retrieve usage statistics" }, { status: 500 })
    }

    // Calculate totals
    const dailyTotal = dailyUsage?.reduce((sum, item) => sum + item.count, 0) || 0
    const monthlyTotal = monthlyUsage?.reduce((sum, item) => sum + item.count, 0) || 0

    // Get endpoint breakdown
    const { data: endpointData, error: endpointError } = await supabase
      .from("api_usage")
      .select("endpoint, count")
      .eq("key_id", keyData.id)
      .gte("timestamp", startOfMonth)
      .not("endpoint", "is", null)

    // Group by endpoint
    const endpointBreakdown: Record<string, number> = {}
    endpointData?.forEach((item) => {
      if (item.endpoint) {
        endpointBreakdown[item.endpoint] = (endpointBreakdown[item.endpoint] || 0) + item.count
      }
    })

    return NextResponse.json({
      plan: keyVerification.plan,
      expiresAt: keyVerification.expiresAt,
      usage: {
        daily: dailyTotal,
        monthly: monthlyTotal,
        remainingDaily: keyVerification.remainingDaily,
        remainingMonthly: keyVerification.remainingMonthly,
        endpoints: endpointBreakdown,
      },
    })
  } catch (error) {
    console.error("Error getting usage stats:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
