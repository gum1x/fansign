import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Early return if we're in build mode
    if (env.isBuild) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    const imageId = params.id

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      )
    }

    // For now, return a placeholder response
    // This would typically fetch from a temporary storage or database
    return NextResponse.json({
      url: `/placeholder.svg`,
      id: imageId,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    })
  } catch (error) {
    console.error('Temp image API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}