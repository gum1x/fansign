"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, UserPlus, LogIn, Gift } from 'lucide-react'
import type { AuthUser } from '@/lib/auth'

interface RegisterFormProps {
  onRegister: (user: AuthUser) => void
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      onRegister(data.user)
    } catch (error) {
      console.error('Registration error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-0 bg-black/80 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)]">
      <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50">
        <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300 flex items-center justify-center">
          <UserPlus className="w-5 h-5 mr-2" />
          Create Account
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 bg-gradient-to-b from-gray-900/50 to-black/50">
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-md">
          <p className="text-green-400 text-sm flex items-center">
            <Gift className="w-4 h-4 mr-2" />
            Get 10 free credits when you sign up!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="bg-gray-800/50 border-purple-700/50 text-white placeholder-gray-400 focus:border-purple-500"
              placeholder="Choose a username (min 3 characters)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-800/50 border-purple-700/50 text-white placeholder-gray-400 focus:border-purple-500"
              placeholder="Create a password (min 6 characters)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-gray-800/50 border-purple-700/50 text-white placeholder-gray-400 focus:border-purple-500"
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </Button>

          <div className="text-center pt-4 border-t border-purple-700/30">
            <p className="text-gray-400 text-sm mb-2">Already have an account?</p>
            <Button
              type="button"
              variant="outline"
              onClick={onSwitchToLogin}
              className="border-purple-700/50 text-purple-300 hover:bg-purple-900/20"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}