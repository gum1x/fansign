import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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