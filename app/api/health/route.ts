import { NextResponse } from 'next/server'
import { testSupabaseConnection, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
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