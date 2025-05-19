"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { createClientSupabase } from "@/utils/supabase"

export default function DebugPage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [supabaseStatus, setSupabaseStatus] = useState<"loading" | "success" | "error">("loading")
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const [tablesStatus, setTablesStatus] = useState<"loading" | "success" | "error">("loading")
  const [tablesError, setTablesError] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<{ [key: string]: boolean }>({})
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // Set a default user ID for testing
    setUserId("debug-user-" + Math.floor(Math.random() * 1000))

    // Check environment variables
    checkEnvironmentVariables()

    // Test Supabase connection
    testSupabaseConnection()

    setLoading(false)
  }, [])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  const checkEnvironmentVariables = () => {
    addLog("Checking environment variables...")

    // Check for client-side accessible env vars
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    setEnvVars(vars)

    const missingVars = Object.entries(vars)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name)

    if (missingVars.length > 0) {
      addLog(`Missing environment variables: ${missingVars.join(", ")}`)
    } else {
      addLog("All client-side environment variables are present")
    }
  }

  const testSupabaseConnection = async () => {
    addLog("Testing Supabase connection...")
    try {
      const supabase = createClientSupabase()

      // Simple ping test
      const { data, error } = await supabase.from("telegram_users").select("count").limit(1)

      if (error) {
        throw error
      }

      addLog("Supabase connection successful")
      setSupabaseStatus("success")

      // Check tables
      await checkTables(supabase)
    } catch (error: any) {
      addLog(`Supabase connection error: ${error.message}`)
      setSupabaseStatus("error")
      setSupabaseError(error.message)
    }
  }

  const checkTables = async (supabase: any) => {
    addLog("Checking database tables...")
    try {
      // Check if required tables exist
      const tables = ["telegram_users", "keys", "image_generations"]
      const tableResults: { [key: string]: boolean } = {}

      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select("count").limit(1)
          if (error) {
            throw error
          }
          tableResults[table] = true
          addLog(`Table '${table}' exists`)
        } catch (error: any) {
          tableResults[table] = false
          addLog(`Error accessing table '${table}': ${error.message}`)
        }
      }

      const missingTables = Object.entries(tableResults)
        .filter(([_, exists]) => !exists)
        .map(([name]) => name)

      if (missingTables.length > 0) {
        setTablesStatus("error")
        setTablesError(`Missing tables: ${missingTables.join(", ")}`)
      } else {
        setTablesStatus("success")
      }
    } catch (error: any) {
      addLog(`Error checking tables: ${error.message}`)
      setTablesStatus("error")
      setTablesError(error.message)
    }
  }

  const testCreateUser = async () => {
    if (!userId) return

    addLog(`Testing user creation for ID: ${userId}`)
    try {
      const supabase = createClientSupabase()

      // First check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from("telegram_users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      if (existingUser) {
        addLog(`User ${userId} already exists`)
        return
      }

      // Create user
      const { data, error } = await supabase
        .from("telegram_users")
        .insert({
          id: userId,
          credits: 5,
          balance: 0,
          is_admin: false,
        })
        .select()

      if (error) {
        throw error
      }

      addLog(`User ${userId} created successfully with 5 credits`)
    } catch (error: any) {
      addLog(`Error creating user: ${error.message}`)
    }
  }

  const testCreateKey = async () => {
    if (!userId) return

    addLog(`Testing key creation`)
    try {
      const supabase = createClientSupabase()

      // Generate a random key code
      const keyCode = generateKeyCode()

      // Create key
      const { data, error } = await supabase
        .from("keys")
        .insert({
          key_code: keyCode,
          tier: "BASIC",
          credits: 10,
          is_redeemed: false,
        })
        .select()

      if (error) {
        throw error
      }

      addLog(`Key ${keyCode} created successfully with 10 credits`)
    } catch (error: any) {
      addLog(`Error creating key: ${error.message}`)
    }
  }

  const generateKeyCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let result = ""
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) result += "-"
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <Card className="w-full max-w-4xl mx-auto border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-purple-300 hover:text-white transition-colors">
              Back
            </Link>
            <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              System Diagnostics
            </CardTitle>
            <div className="w-5"></div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-4 space-y-6">
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Environment Variables */}
                <div className="bg-gray-800/40 border border-purple-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Environment Variables</h3>
                  <ul className="space-y-2">
                    {Object.entries(envVars).map(([name, exists]) => (
                      <li key={name} className="flex items-center">
                        {exists ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <span className={exists ? "text-green-300" : "text-red-300"}>{name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Supabase Connection */}
                <div className="bg-gray-800/40 border border-purple-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Supabase Connection</h3>
                  {supabaseStatus === "loading" ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400 mr-2" />
                      <span>Testing connection...</span>
                    </div>
                  ) : supabaseStatus === "success" ? (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-green-300">Connection successful</span>
                    </div>
                  ) : (
                    <Alert className="bg-red-900/20 border-red-500/30 text-red-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-300/80">{supabaseError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Database Tables */}
                <div className="bg-gray-800/40 border border-purple-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Database Tables</h3>
                  {tablesStatus === "loading" ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400 mr-2" />
                      <span>Checking tables...</span>
                    </div>
                  ) : tablesStatus === "success" ? (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-green-300">All required tables exist</span>
                    </div>
                  ) : (
                    <Alert className="bg-red-900/20 border-red-500/30 text-red-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-300/80">{tablesError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Test Actions */}
                <div className="bg-gray-800/40 border border-purple-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Test Actions</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-400">Test User ID: {userId}</span>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button onClick={testCreateUser} className="bg-purple-700 hover:bg-purple-600">
                        Test Create User
                      </Button>
                      <Button onClick={testCreateKey} className="bg-blue-700 hover:bg-blue-600">
                        Test Create Key
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logs */}
              <div className="bg-gray-800/40 border border-purple-900/50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Diagnostic Logs</h3>
                <div className="bg-black/50 p-3 rounded-md max-h-80 overflow-y-auto font-mono text-xs">
                  {logs.map((log, index) => (
                    <div key={index} className="text-gray-300 mb-1">
                      {log}
                    </div>
                  ))}
                  {logs.length === 0 && <div className="text-gray-500">No logs yet</div>}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
