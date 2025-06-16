import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      const userId = paymentIntent.metadata.userId
      const credits = parseInt(paymentIntent.metadata.credits)

      if (!userId || !credits) {
        console.error('Missing metadata in payment intent:', paymentIntent.id)
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      // Update payment status
      const { error: paymentUpdateError } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('stripe_payment_intent_id', paymentIntent.id)

      if (paymentUpdateError) {
        console.error('Error updating payment status:', paymentUpdateError)
      }

      // Add credits to user account
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single()

      if (userError || !currentUser) {
        console.error('Error fetching user for credit update:', userError)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const { error: creditUpdateError } = await supabase
        .from('users')
        .update({ credits: currentUser.credits + credits })
        .eq('id', userId)

      if (creditUpdateError) {
        console.error('Error updating user credits:', creditUpdateError)
        return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
      }

      console.log(`Successfully added ${credits} credits to user ${userId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}