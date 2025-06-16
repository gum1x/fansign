"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { User, LogOut, CreditCard, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { authService } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

export default function UserMenu() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    // Refresh user data periodically to get updated credits
    const interval = setInterval(async () => {
      const refreshedUser = await authService.refreshUserData()
      if (refreshedUser) {
        setUser(refreshedUser)
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    authService.logout()
    window.location.href = '/auth'
  }

  if (!user) {
    return (
      <Button asChild variant="outline" className="border-purple-700/50 text-purple-300">
        <Link href="/auth">
          <User className="w-4 h-4 mr-2" />
          Sign In
        </Link>
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="border-purple-700/50 text-purple-300 hover:bg-purple-900/20"
      >
        <User className="w-4 h-4 mr-2" />
        {user.username}
        <div className="ml-2 px-2 py-1 bg-purple-700/30 rounded-full text-xs">
          {user.credits} credits
        </div>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-purple-700/50 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-purple-700/30">
            <p className="font-semibold text-white">{user.username}</p>
            <div className="flex items-center mt-2">
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
              <span className="text-purple-300">{user.credits} credits available</span>
            </div>
          </div>

          <div className="p-2">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-left hover:bg-purple-900/20"
            >
              <Link href="/purchase" onClick={() => setIsOpen(false)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Purchase Credits
              </Link>
            </Button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-left hover:bg-red-900/20 text-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}