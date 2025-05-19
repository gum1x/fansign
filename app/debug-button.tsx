"use client"

import { useState } from "react"
import Link from "next/link"
import { Bug, X } from "lucide-react"

export function DebugButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-2 w-64">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Debug Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close debug menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            <Link
              href="/debug-links"
              className="block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => setIsOpen(false)}
            >
              Debug Tools Home
            </Link>
            <Link
              href="/debug-redeem"
              className="block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => setIsOpen(false)}
            >
              Debug Key Redemption
            </Link>
            <Link
              href="/debug-database"
              className="block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => setIsOpen(false)}
            >
              Database Diagnostics
            </Link>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Open debug menu"
        >
          <Bug className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
