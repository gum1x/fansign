"use client"

import { useEffect, useState } from "react"
import { getUserCredits } from "@/app/actions/keyActions"
import { useSession } from "@/hooks/use-session"

export function UserCredits() {
  const [credits, setCredits] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { session } = useSession()

  useEffect(() => {
    async function fetchCredits() {
      if (!session?.userId) return

      setIsLoading(true)
      try {
        const result = await getUserCredits(session.userId)
        if (result.success) {
          setCredits(result.credits)
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredits()
  }, [session?.userId])

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading credits...</div>
  }

  return (
    <div className="flex items-center">
      <span className="text-sm font-medium mr-1">Credits:</span>
      <span className="text-sm font-bold">{credits !== null ? credits : "N/A"}</span>
    </div>
  )
}
