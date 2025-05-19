export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface ApiKey {
  id: string
  key_hash: string
  name: string
  plan_type: "basic" | "premium" | "unlimited"
  expires_at: string | null
  max_usage: number | null
  user_id: string
  is_active: boolean
  created_at: string
}

export interface KeyUsage {
  id: number
  key_id: string
  used_at: string
}

export interface UsageCount {
  count: number
}

export interface ApiKeyWithUsage extends ApiKey {
  usage_count?: UsageCount[]
}

export interface Session {
  userId: string
  apiKey: string
  keyId: string
  planType: "basic" | "premium" | "unlimited"
  expiresAt: string | null
  isActive: boolean
}

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string
          key: string
          plan: string
          created_at: string
          expires_at: string
          is_active: boolean
          created_by?: string | null
          notes?: string | null
        }
        Insert: {
          id?: string
          key: string
          plan: string
          created_at: string
          expires_at: string
          is_active: boolean
          created_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          key?: string
          plan?: string
          created_at?: string
          expires_at?: string
          is_active?: boolean
          created_by?: string | null
          notes?: string | null
        }
      }
      api_usage: {
        Row: {
          id: string
          key_id: string
          timestamp: string
          count: number
          endpoint?: string | null
          details?: Json | null
        }
        Insert: {
          id?: string
          key_id: string
          timestamp: string
          count: number
          endpoint?: string | null
          details?: Json | null
        }
        Update: {
          id?: string
          key_id?: string
          timestamp?: string
          count?: number
          endpoint?: string | null
          details?: Json | null
        }
      }
      telegram_users: {
        Row: {
          id: number
          telegram_id: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          created_at: string
          updated_at: string
          credits?: number | null
          is_admin?: boolean | null
        }
        Insert: {
          id?: number
          telegram_id: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
          credits?: number | null
          is_admin?: boolean | null
        }
        Update: {
          id?: number
          telegram_id?: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
          credits?: number | null
          is_admin?: boolean | null
        }
      }
      // Add other existing tables here
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
