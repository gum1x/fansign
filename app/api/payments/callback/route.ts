import { NextRequest, NextResponse } from 'next/server'
import { oxaPayService } from '@/lib/oxapay'
import { supabase } from '@/lib/supabase'
import type { OxaPayCallbackData } from '@/lib/oxapay'

export async function POST(request: NextRequest) {
  try {
    const callbackData: OxaPayCallbackData = await request.json()

    console.log('OxaPay callback received:', callbackData)

    // Verify HMAC signature
    if (!oxaPayService.verifyCallback(callbackData, callbackData.hmac)) {
      console.error('Invalid HMAC signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Find the payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('oxapay_track_id', callbackData.trackId.toString())
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found:', callbackData.trackId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Check if payment is successful
    if (callbackData.status === 'Paid' && callbackData.type === 'payment') {
      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          tx_id: callbackData.txID,
          paid_amount: callbackData.amount,
          paid_currency: callbackData.currency,
          paid_date: callbackData.date
        })
        .eq('oxapay_track_id', callbackData.trackId.toString())

      if (updateError) {
        console.error('Error updating payment status:', updateError)
      }

      // Add credits to user account
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', payment.user_id)
        .single()

      if (userError || !currentUser) {
        console.error('Error fetching user for credit update:', userError)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const { error: creditUpdateError } = await supabase
        .from('users')
        .update({ credits: currentUser.credits + payment.credits_purchased })
        .eq('id', payment.user_id)

      if (creditUpdateError) {
        console.error('Error updating user credits:', creditUpdateError)
        return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
      }

      console.log(`Successfully added ${payment.credits_purchased} credits to user ${payment.user_id}`)
    } else if (callbackData.status === 'Failed' || callbackData.status === 'Expired') {
      // Update payment status to failed
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          tx_id: callbackData.txID,
          paid_date: callbackData.date
        })
        .eq('oxapay_track_id', callbackData.trackId.toString())

      if (updateError) {
        console.error('Error updating payment status to failed:', updateError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 })
  }
}