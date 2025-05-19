"use client"

import { useState, useEffect } from "react"
import { verifyAuthToken } from "@/lib/auth"

interface SessionData {
  isAuthenticated: boolean
  userId?: string
  loading: boolean
}

export function useSession(): SessionData {
  const [session, setSession] = useState<SessionData>({
    isAuthenticated: false,
    loading: true,
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem("telegram_auth_token")

        if (!token) {
          setSession({ isAuthenticated: false, loading: false })
          return
        }

        // Verify the token
        const { valid, userId } = verifyAuthToken(token)

        if (valid && userId) {
          setSession({
            isAuthenticated: true,
            userId,
            loading: false,
          })
        } else {
          // Token is invalid, clear it
          localStorage.removeItem("telegram_auth_token")
          setSession({ isAuthenticated: false, loading: false })
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setSession({ isAuthenticated: false, loading: false })
      }
    }

    checkAuth()
  }, [])

  return session
}
