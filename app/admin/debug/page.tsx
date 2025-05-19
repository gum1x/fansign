"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DebugPage() {
  const [requestId, setRequestId] = useState("")
  const [adminSecret, setAdminSecret] = useState("")
  const [limit, setLimit] = useState("10")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkTransaction = async () => {
    if (!requestId || !adminSecret) {
      setError("Request ID and Admin Secret are required")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/debug/check-transaction?requestId=${requestId}&secret=${adminSecret}`)
      const data = await response.json()
      setResult(data)
      if (!data.success) {
        setError(data.error || "Unknown error")
      }
    } catch (error) {
      console.error("Error checking transaction:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAllDeposits = async () => {
    if (!adminSecret) {
      setError("Admin Secret is required")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/debug/check-all-deposits?limit=${limit}&secret=${adminSecret}`)
      const data = await response.json()
      setResult(data)
      if (!data.success) {
        setError(data.error || "Unknown error")
      }
    } catch (error) {
      console.error("Error checking all deposits:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Transaction Debug Tools</h1>

      <Tabs defaultValue="check-transaction" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="check-transaction">Check Transaction</TabsTrigger>
          <TabsTrigger value="check-all-deposits">Check All Deposits</TabsTrigger>
        </TabsList>

        <TabsContent value="check-transaction">
          <Card>
            <CardHeader>
              <CardTitle>Check Transaction</CardTitle>
              <CardDescription>
                Check a specific deposit request to see if transactions are being detected correctly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Request ID</label>
                <Input
                  type="text"
                  value={requestId}
                  onChange={(e) => setRequestId(e.target.value)}
                  placeholder="Enter deposit request ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Secret</label>
                <Input
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="Enter admin secret"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={checkTransaction} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Check Transaction
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="check-all-deposits">
          <Card>
            <CardHeader>
              <CardTitle>Check All Deposits</CardTitle>
              <CardDescription>Check multiple recent deposit requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Limit</label>
                <Input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="Number of deposits to check"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Secret</label>
                <Input
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="Enter admin secret"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={checkAllDeposits} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Check All Deposits
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {error && <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">{error}</div>}

      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Result</h2>
          <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px]">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
