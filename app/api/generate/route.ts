import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth'
import { supabase, handleDatabaseError, isSupabaseConfigured } from '@/lib/supabase'
import { GENERATION_COSTS } from '@/lib/oxapay'

export async function POST(request: NextRequest) {
  try {
    const { userId, style, textContent, imageUrl } = await request.json()

    if (!userId || !style) {
      return NextResponse.json(
        { error: 'User ID and style are required' },
        { status: 400 }
      )
    }

    // Get credit cost for this style
    const creditCost = GENERATION_COSTS[style as keyof typeof GENERATION_COSTS] || 1

    if (!isSupabaseConfigured()) {
      // Demo mode - just return success
      return NextResponse.json({
        success: true,
        creditsUsed: creditCost,
        remainingCredits: 25 - creditCost // Mock remaining credits
      })
    }

    // Verify user has enough credits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.credits < creditCost) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: creditCost, available: user.credits },
        { status: 402 }
      )
    }

    // Deduct credits
    const { error: deductError } = await supabase
      .from('users')
      .update({ credits: user.credits - creditCost })
      .eq('id', userId)

    if (deductError) {
      const dbError = handleDatabaseError(deductError, 'Failed to deduct credits')
      return NextResponse.json(
        { error: dbError.error },
        { status: 500 }
      )
    }

    // Store generation record
    const { error: generationError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        style,
        text_content: textContent || '',
        image_url: imageUrl || '',
        credits_used: creditCost
      })

    if (generationError) {
      console.error('Error storing generation record:', generationError)
      // Continue anyway, credits already deducted
    }

    return NextResponse.json({
      success: true,
      creditsUsed: creditCost,
      remainingCredits: user.credits - creditCost
    })
  } catch (error) {
    console.error('Generation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}