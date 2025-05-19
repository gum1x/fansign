"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { verifyAuthToken } from "@/lib/auth"

interface SessionContextType {
  isAuthenticated: boolean
  userId?: string
  loading: boolean
}

const SessionContext = createContext<SessionContextType>({
  isAuthenticated: false,
  loading: true,
})

export function useSessionContext() {
  return useContext(SessionContext)
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionContextType>({
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

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
