"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function DebugEnvPage() {
  const [clientEnvVars, setClientEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    // Only check client-side environment variables
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? "Set" : "Missing",
    }

    setClientEnvVars(vars)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>

      <div className="mb-4">
        <Link href="/debug-links" className="text-blue-500 hover:underline">
          ← Back to Debug Links
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Client-Side Environment Variables</h2>

        <div className="space-y-2">
          {Object.entries(clientEnvVars).map(([key, value]) => (
            <div key={key} className={`p-2 rounded ${value === "Set" ? "bg-green-50" : "bg-red-50"}`}>
              {key}: {value}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded">
          <h3 className="font-medium">Important Notes</h3>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li>Only NEXT_PUBLIC_* variables are available on the client side</li>
            <li>Server-side variables (like SUPABASE_URL) cannot be checked here</li>
            <li>Check the database diagnostics page for server-side environment variables</li>
            <li>
              <Link href="/debug-database" className="text-blue-500 hover:underline">
                Go to Database Diagnostics
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
