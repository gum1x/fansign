"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugErrorPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResults = async (action = "all") => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/debug/full-error?action=${action}`)
      const data = await response.json()
      setResults(data)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Full Error</h1>

      <div className="mb-4 flex space-x-2">
        <Button onClick={() => fetchResults("all")} disabled={loading}>
          Test All
        </Button>
        <Button onClick={() => fetchResults("getUserCredits")} disabled={loading}>
          Test getUserCredits
        </Button>
        <Button onClick={() => fetchResults("redeemKey")} disabled={loading}>
          Test redeemKey
        </Button>
      </div>

      {loading && <p>Loading...</p>}

      {error && (
        <Card className="mb-4 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-4">
          {Object.entries(results).map(([key, value]: [string, any]) => (
            <Card key={key} className={value?.status === "error" || value?.status === "exception" ? "bg-red-50" : ""}>
              <CardHeader>
                <CardTitle>{key}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{JSON.stringify(value, null, 2)}</pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
