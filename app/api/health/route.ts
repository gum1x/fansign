import { NextResponse } from 'next/server'
import { testSupabaseConnection, isSupabaseConfigured } from '@/lib/supabase'
import { env } from '@/lib/env'

export async function GET() {
  try {
    // Handle build mode gracefully
    if (env.isBuild) {
      return NextResponse.json({
        status: 'build-mode',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          supabase: {
            configured: false,
            connected: false,
            error: 'Build mode - environment variables not available'
          }
        }
      })
    }

    const supabaseStatus = await testSupabaseConnection()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        supabase: {
          configured: isSupabaseConfigured(),
          connected: supabaseStatus.success,
          error: supabaseStatus.error || null
        }
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}