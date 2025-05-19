"use client"

import { useState, useEffect } from "react"
import { checkDatabaseConnection } from "../actions/debugKeyActions"
import Link from "next/link"

export default function DebugDatabasePage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    async function runDiagnostics() {
      try {
        console.log("Starting database diagnostics")
        const result = await checkDatabaseConnection()
        console.log("Received diagnostic results:", result)
        setResults(result)

        if (result.environment) {
          setEnvVars(result.environment)
        }
      } catch (err) {
        console.error("Error running diagnostics:", err)
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    runDiagnostics()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Database Diagnostics</h1>

      <div className="mb-4">
        <Link href="/debug-links" className="text-blue-500 hover:underline">
          ← Back to Debug Links
        </Link>
      </div>

      {loading ? (
        <div className="p-4 bg-blue-50 rounded">
          <p>Running database diagnostics...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-800 rounded">
          <h2 className="font-bold">Error</h2>
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Connection Status</h3>
              <div className={`p-2 rounded ${results.connected ? "bg-green-50" : "bg-red-50"}`}>
                {results.connected ? "✅ Connected" : "❌ Failed to connect"}
              </div>
              {results.message && <p className="mt-2 text-sm text-red-600">{results.message}</p>}
            </div>

            <div>
              <h3 className="font-medium">Environment Variables</h3>
              <div className="space-y-1 mt-2">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className={`text-sm ${value === "Missing" ? "text-red-600" : "text-green-600"}`}>
                    {key}: {value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {results.connected && results.tables && (
            <div className="mt-4">
              <h3 className="font-medium">Tables Check</h3>
              <div className="space-y-2 mt-2">
                {Object.entries(results.tables).map(([tableName, status]: [string, any]) => (
                  <div key={tableName} className={`p-2 rounded ${status.exists ? "bg-green-50" : "bg-red-50"}`}>
                    {tableName}: {status.exists ? "✅ Exists" : "❌ Missing"}
                    {status.count !== undefined && <span className="text-sm ml-2">({status.count} rows)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium">Raw Data</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60 mt-2">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded">
            <h3 className="font-medium">Troubleshooting</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Make sure all required environment variables are set in your Vercel project</li>
              <li>Check that your Supabase database is online and accessible</li>
              <li>Verify that the required tables have been created</li>
              <li>Try running the setup script to create missing tables</li>
              <li>
                <Link href="/admin/setup-credits" className="text-blue-500 hover:underline">
                  Run Setup Credits
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
