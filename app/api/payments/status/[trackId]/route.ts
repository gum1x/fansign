import { NextRequest, NextResponse } from 'next/server'
import { oxaPayService } from '@/lib/oxapay'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { trackId: string } }
) {
  try {
    const trackId = parseInt(params.trackId)

    if (isNaN(trackId)) {
      return NextResponse.json(
        { error: 'Invalid track ID' },
        { status: 400 }
      )
    }

    if (!isSupabaseConfigured()) {
      // Demo mode - return completed status
      return NextResponse.json({
        trackId: trackId,
        status: 'completed',
        amount: 5.99,
        credits: 25,
        oxaPayStatus: { result: 100, status: 'completed', message: 'Demo payment completed' }
      })
    }

    // Get payment status from OxaPay
    const statusResponse = await oxaPayService.getPaymentStatus(trackId)

    // Also get our local payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('oxapay_track_id', trackId.toString())
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      trackId: trackId,
      status: statusResponse.status || payment.status,
      amount: payment.amount,
      credits: payment.credits_purchased,
      oxaPayStatus: statusResponse
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}