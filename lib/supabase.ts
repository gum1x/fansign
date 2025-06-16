import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Database types
export interface User {
  id: string
  username: string
  password_hash: string
  credits: number
  created_at: string
  updated_at: string
}

export interface Generation {
  id: string
  user_id: string
  style: string
  text_content: string
  image_url: string
  credits_used: number
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  oxapay_track_id: string
  order_id: string
  amount: number
  credits_purchased: number
  status: string
  created_at: string
}

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') && 
         !env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')
}

// Helper function to handle database errors gracefully
export function handleDatabaseError(error: any, fallbackMessage: string = 'Database operation failed') {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured, using fallback behavior')
    return { error: 'Database not configured', isConfigError: true }
  }
  
  console.error('Database error:', error)
  return { error: fallbackMessage, isConfigError: false }
}