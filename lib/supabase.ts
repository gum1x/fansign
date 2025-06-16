import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// Create Supabase client with safe fallbacks for build time
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Additional validation and cleaning for Supabase keys
function validateAndCleanSupabaseKey(key: string, keyName: string): string {
  if (!key || key === 'placeholder-key') {
    console.warn(`⚠️ ${keyName} is not properly configured`)
    return key
  }
  
  // Clean the key thoroughly
  const cleanKey = key.trim().replace(/^["']|["']$/g, '').replace(/\n/g, '').replace(/\r/g, '')
  
  // Validate key format
  if (keyName.includes('ANON') && !cleanKey.startsWith('eyJ')) {
    console.warn(`⚠️ ${keyName} appears to be malformed (should start with 'eyJ')`)
  }
  
  if (keyName.includes('SERVICE') && !cleanKey.startsWith('eyJ')) {
    console.warn(`⚠️ ${keyName} appears to be malformed (should start with 'eyJ')`)
  }
  
  return cleanKey
}

const cleanSupabaseUrl = supabaseUrl.trim()
const cleanSupabaseAnonKey = validateAndCleanSupabaseKey(supabaseAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Only create Supabase client if we have valid credentials
let supabase: any = null

try {
  if (cleanSupabaseUrl && cleanSupabaseAnonKey && 
      !cleanSupabaseUrl.includes('placeholder') && 
      !cleanSupabaseAnonKey.includes('placeholder')) {
    supabase = createClient(
      cleanSupabaseUrl,
      cleanSupabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    )
  } else {
    console.warn('⚠️ Supabase credentials not configured, running in demo mode')
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
}

export { supabase }

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
  // During build time, always return false to prevent API calls
  if (env.isBuild || typeof window === 'undefined') {
    return false
  }
  
  return !!(
    supabase &&
    env.NEXT_PUBLIC_SUPABASE_URL && 
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://') &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 20 &&
    !env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
    !env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')
  )
}

// Helper function to handle database errors gracefully
export function handleDatabaseError(error: any, fallbackMessage: string = 'Database operation failed') {
  if (!isSupabaseConfigured()) {
    return { error: 'Database not configured', isConfigError: true }
  }
  
  console.error('Database error:', error)
  
  // Handle specific Supabase errors
  if (error?.code === 'PGRST116') {
    return { error: 'No data found', isConfigError: false }
  }
  
  if (error?.code === '23505') {
    return { error: 'Data already exists', isConfigError: false }
  }
  
  if (error?.code === '23503') {
    return { error: 'Referenced data not found', isConfigError: false }
  }
  
  return { error: fallbackMessage, isConfigError: false }
}

// Test Supabase connection
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    // Skip during build time
    if (env.isBuild || typeof window === 'undefined') {
      return { success: false, error: 'Build mode - skipping connection test' }
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured' }
    }

    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Connection failed' }
  }
}