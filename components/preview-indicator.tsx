"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"

export function PreviewIndicator() {
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    // Check for Vercel preview environment
    const isVercelPreview =
      process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || window.location.hostname.includes("vercel.app")

    setIsPreview(isVercelPreview)
  }, [])

  if (!isPreview) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-900/90 text-white text-sm py-1 px-4 flex items-center justify-center z-50">
      <Info className="w-4 h-4 mr-2" />
      <span>Preview Environment - Special handling enabled</span>
    </div>
  )
}
