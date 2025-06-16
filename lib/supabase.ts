import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
  stripe_payment_intent_id: string
  amount: number
  credits_purchased: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}