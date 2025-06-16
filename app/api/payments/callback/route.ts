import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    // Early return if we're in build mode
    if (env.isBuild) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    // For now, just return a success response
    // This can be implemented later when payment processing is needed
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Early return if we're in build mode
    if (env.isBuild) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    // For now, just return a success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}