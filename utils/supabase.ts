import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

// Types for our database
export type TelegramUser = {
  id: string
  balance: number
  created_at?: string
  updated_at?: string
  is_admin: boolean
  credits?: number
}

export type TelegramTransaction = {
  id: string
  user_id: string
  amount: number
  status: "pending" | "completed" | "cancelled" | "expired"
  type: "payment" | "fansign" | "admin_credit"
  description?: string
  track_id?: string
  created_at?: string
}

// Client-side singleton to prevent multiple instances
let supabaseInstance: ReturnType<typeof supabaseCreateClient> | null = null

export const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[SUPABASE] Missing environment variables for client-side Supabase")
    throw new Error("Missing Supabase environment variables")
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = supabaseCreateClient(supabaseUrl, supabaseAnonKey)
    } catch (error) {
      console.error("[SUPABASE] Error creating client-side instance:", error)
      throw error
    }
  }
  return supabaseInstance
}

// Client-side function to create a new Supabase client (not singleton)
export const createClientSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[SUPABASE] Missing environment variables for client Supabase")
    throw new Error("Missing Supabase environment variables")
  }

  try {
    return supabaseCreateClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("[SUPABASE] Error creating client instance:", error)
    throw error
  }
}

// Server-side client (for server actions)
export const createServerSupabase = () => {
  try {
    // Use environment variables consistently
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url) {
      throw new Error("Missing Supabase URL environment variable")
    }

    if (!key) {
      throw new Error("Missing Supabase key environment variable")
    }

    console.log("[SUPABASE] Creating server client with URL:", url.substring(0, 10) + "...")

    const client = supabaseCreateClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    return client
  } catch (error) {
    console.error("[SUPABASE] Error creating server client:", error)
    throw error
  }
}

export const createClient = (cookieStore: any) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      throw new Error("Missing Supabase URL environment variable")
    }

    if (!supabaseKey) {
      throw new Error("Missing Supabase key environment variable")
    }

    return supabaseCreateClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookies.set error
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // Handle cookies.remove error
          }
        },
      },
    })
  } catch (error) {
    console.error("[SUPABASE] Error in createClient:", error)
    throw error
  }
}
