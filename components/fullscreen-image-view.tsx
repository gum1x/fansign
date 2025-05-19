"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface FullscreenImageViewProps {
  imageUrl: string
  onClose: () => void
}

export function FullscreenImageView({ imageUrl, onClose }: FullscreenImageViewProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Detect if we're in Telegram WebApp
  const isTelegramWebApp = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp

  // Expand Telegram WebApp when entering fullscreen
  useEffect(() => {
    if (isTelegramWebApp) {
      window.Telegram.WebApp.expand()
    }

    // Clean up when component unmounts
    return () => {
      // Nothing to clean up for now
    }
  }, [isTelegramWebApp])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center" onClick={onClose}>
      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white"
        onClick={(e) => {
          e.stopPropagation() // Prevent the click from bubbling to the background
          onClose()
        }}
      >
        <X size={24} />
      </button>

      {/* Image container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()} // Prevent clicks on image from closing
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Fullscreen view"
          className={`max-w-full max-h-full object-contain ${isLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* Instructions at the bottom */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white bg-black/50 py-2 px-4">
        Take a screenshot now, then tap anywhere to exit
      </div>
    </div>
  )
}
