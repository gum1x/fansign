import { NextRequest, NextResponse } from 'next/server'
import { oxaPayService, CREDIT_PACKAGES } from '@/lib/oxapay'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

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

    // Generate unique order ID
    const orderId = `order_${nanoid()}`

    // Create OxaPay payment request
    const paymentRequest = {
      merchant: process.env.OXAPAY_MERCHANT_KEY!,
      amount: creditPackage.price,
      currency: 'USD',
      lifeTime: 30, // 30 minutes
      feePaidByPayer: 1, // User pays the fee
      underPaidCover: 5, // 5% underpaid tolerance
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/purchase?success=true`,
      description: `${creditPackage.name} for ${user.username}`,
      orderId: orderId,
      email: '', // Optional
    }

    const paymentResponse = await oxaPayService.createPayment(paymentRequest)

    if (paymentResponse.result !== 100) {
      return NextResponse.json(
        { error: paymentResponse.message || 'Failed to create payment' },
        { status: 400 }
      )
    }

    // Store payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        oxapay_track_id: paymentResponse.trackId?.toString(),
        order_id: orderId,
        amount: creditPackage.price,
        credits_purchased: creditPackage.credits,
        status: 'pending'
      })

    if (paymentError) {
      console.error('Error storing payment record:', paymentError)
      // Continue anyway, we can handle this in callback
    }

    return NextResponse.json({
      success: true,
      payLink: paymentResponse.payLink,
      trackId: paymentResponse.trackId,
      orderId: orderId,
      amount: creditPackage.price,
      credits: creditPackage.credits
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}