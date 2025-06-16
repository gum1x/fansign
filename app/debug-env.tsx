"use client"

import { useEffect, useState } from 'react'

export default function DebugEnv() {
  const [envInfo, setEnvInfo] = useState<any>({})

  useEffect(() => {
    // Check environment variables
    const info = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      supabaseAnonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      supabaseUrlStartsWith: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
      supabaseAnonKeyStartsWith: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20),
      hasPlaceholder: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder'),
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('placeholder')
      }
    }
    setEnvInfo(info)
    console.log('Environment Debug Info:', info)
  }, [])

  return (
    <div className="p-4 bg-gray-100 text-black">
      <h2 className="text-xl font-bold mb-4">Environment Debug Info</h2>
      <pre className="bg-white p-4 rounded border overflow-auto">
        {JSON.stringify(envInfo, null, 2)}
      </pre>
    </div>
  )
}