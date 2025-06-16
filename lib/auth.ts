import bcrypt from 'bcryptjs'
import { supabase } from './supabase'
import type { User } from './supabase'

export interface AuthUser {
  id: string
  username: string
  credits: number
}

export class AuthService {
  private static instance: AuthService
  private currentUser: AuthUser | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async register(username: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      if (existingUser) {
        return { success: false, error: 'Username already exists' }
      }

      // Hash password
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(password, saltRounds)

      // Create user with 10 free credits
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          username,
          password_hash: passwordHash,
          credits: 10 // Free credits for new users
        })
        .select('id, username, credits')
        .single()

      if (error) {
        console.error('Registration error:', error)
        return { success: false, error: 'Failed to create account' }
      }

      const authUser: AuthUser = {
        id: newUser.id,
        username: newUser.username,
        credits: newUser.credits
      }

      this.currentUser = authUser
      this.saveToLocalStorage(authUser)

      return { success: true, user: authUser }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    try {
      // Get user by username
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, password_hash, credits')
        .eq('username', username)
        .single()

      if (error || !user) {
        return { success: false, error: 'Invalid username or password' }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        return { success: false, error: 'Invalid username or password' }
      }

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        credits: user.credits
      }

      this.currentUser = authUser
      this.saveToLocalStorage(authUser)

      return { success: true, user: authUser }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  logout(): void {
    this.currentUser = null
    localStorage.removeItem('auth_user')
  }

  getCurrentUser(): AuthUser | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored)
          return this.currentUser
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('auth_user')
        }
      }
    }

    return null
  }

  async refreshUserData(): Promise<AuthUser | null> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return null

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, credits')
        .eq('id', currentUser.id)
        .single()

      if (error || !user) {
        this.logout()
        return null
      }

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        credits: user.credits
      }

      this.currentUser = authUser
      this.saveToLocalStorage(authUser)

      return authUser
    } catch (error) {
      console.error('Error refreshing user data:', error)
      return null
    }
  }

  async deductCredits(amount: number): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    if (currentUser.credits < amount) {
      return { success: false, error: 'Insufficient credits' }
    }

    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ credits: currentUser.credits - amount })
        .eq('id', currentUser.id)
        .select('credits')
        .single()

      if (error) {
        console.error('Error deducting credits:', error)
        return { success: false, error: 'Failed to deduct credits' }
      }

      // Update local user data
      this.currentUser.credits = updatedUser.credits
      this.saveToLocalStorage(this.currentUser)

      return { success: true, newBalance: updatedUser.credits }
    } catch (error) {
      console.error('Error deducting credits:', error)
      return { success: false, error: 'Failed to deduct credits' }
    }
  }

  private saveToLocalStorage(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(user))
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}

export const authService = AuthService.getInstance()