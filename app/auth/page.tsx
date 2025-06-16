"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import { authService } from '../lib/auth'
import type { AuthUser } from '../lib/auth'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      router.push('/generate')
    }
  }, [router])

  const handleLogin = (user: AuthUser) => {
    router.push('/generate')
  }

  const handleRegister = (user: AuthUser) => {
    router.push('/generate')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  )
}