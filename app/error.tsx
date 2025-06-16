'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 bg-black/80 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)]">
        <CardHeader className="bg-gradient-to-r from-red-800 to-red-900 border-b border-red-700/50">
          <CardTitle className="text-center text-xl font-bold text-white flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Something went wrong!
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 bg-gradient-to-b from-gray-900/50 to-black/50 text-center">
          <p className="text-gray-300 mb-6">
            We encountered an unexpected error. This might be a temporary issue.
          </p>

          <div className="space-y-4">
            <Button
              onClick={reset}
              className="w-full bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-purple-700/50 text-purple-300 hover:bg-purple-900/20"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Link>
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                Error details (development only)
              </summary>
              <pre className="mt-2 text-xs text-red-400 bg-gray-900/50 p-3 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}