import { NextRequest, NextResponse } from 'next/server'
import { stripe, CREDIT_PACKAGES } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { packageId, userId } = await request.json()

    if (!packageId || !userId) {
      return NextResponse.json(
        { error: 'Package ID and User ID are required' },
        { status: 400 }
      )
    }

    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId)
    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      )
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: creditPackage.price,
      currency: 'usd',
      metadata: {
        userId,
        packageId,
        credits: creditPackage.credits.toString(),
        username: user.username
      },
      description: `${creditPackage.name} for ${user.username}`
    })

    // Store payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: creditPackage.price,
        credits_purchased: creditPackage.credits,
        status: 'pending'
      })

    if (paymentError) {
      console.error('Error storing payment record:', paymentError)
      // Continue anyway, we can handle this in webhook
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: creditPackage.price,
      credits: creditPackage.credits
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}