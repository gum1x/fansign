"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  adminAssignCredits,
  generateDistributionKey,
  generateMultipleKeys,
  getAllDistributionKeys,
  getUserCredits,
  getUserTransactions,
  validateKey,
} from "@/app/actions/creditActions"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, RefreshCw, Copy, Check, Search, Plus, Download } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminCreditsPage() {
  const router = useRouter()
  const { toast } = useToast()

  // State for key generation
  const [keyType, setKeyType] = useState("STANDARD")
  const [creditsValue, setCreditsValue] = useState(10)
  const [generatingKey, setGeneratingKey] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [keyCopied, setKeyCopied] = useState(false)

  // State for bulk key generation
  const [bulkKeyConfig, setBulkKeyConfig] = useState({
    BASIC: { count: 1, credits: 1 },
    STANDARD: { count: 1, credits: 5 },
    PREMIUM: { count: 1, credits: 20 },
    UNLIMITED: { count: 1, credits: 999 },
  })
  const [generatingBulkKeys, setGeneratingBulkKeys] = useState(false)
  const [generatedBulkKeys, setGeneratedBulkKeys] = useState<any[]>([])

  // State for direct credit assignment
  const [userId, setUserId] = useState("")
  const [creditAmount, setCreditAmount] = useState(10)
  const [description, setDescription] = useState("")
  const [assigningCredits, setAssigningCredits] = useState(false)

  // State for key validation
  const [keyToValidate, setKeyToValidate] = useState("")
  const [validatingKey, setValidatingKey] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)

  // State for user lookup
  const [userIdToLookup, setUserIdToLookup] = useState("")
  const [lookingUpUser, setLookingUpUser] = useState(false)
  const [userLookupResult, setUserLookupResult] = useState<any>(null)
  const [userTransactions, setUserTransactions] = useState<any[]>([])

  // State for key listing
  const [keys, setKeys] = useState<any[]>([])
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [keyFilters, setKeyFilters] = useState({
    keyType: "ALL", // Updated default value
    isUsed: undefined as boolean | undefined,
    isActive: true,
    search: "",
  })

  // Load keys on mount
  useEffect(() => {
    loadKeys()
  }, [keyFilters])

  // Function to load keys
  async function loadKeys() {
    setLoadingKeys(true)

    try {
      const result = await getAllDistributionKeys(100, 0, keyFilters)

      if (result.success) {
        setKeys(result.keys)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load keys",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading keys:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading keys",
        variant: "destructive",
      })
    } finally {
      setLoadingKeys(false)
    }
  }

  // Function to generate a single key
  async function handleGenerateKey() {
    setGeneratingKey(true)
    setGeneratedKey(null)

    try {
      const adminId = "7314936460" // Admin user ID
      const result = await generateDistributionKey(creditsValue, keyType, adminId)

      if (result.success) {
        setGeneratedKey(result.key)
        toast({
          title: "Success",
          description: `Generated key with ${creditsValue} credits`,
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate key",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating key:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating key",
        variant: "destructive",
      })
    } finally {
      setGeneratingKey(false)
    }
  }

  // Function to generate bulk keys
  async function handleGenerateBulkKeys() {
    setGeneratingBulkKeys(true)
    setGeneratedBulkKeys([])

    try {
      const adminId = "7314936460" // Admin user ID
      const result = await generateMultipleKeys(adminId, bulkKeyConfig)

      if (result.success) {
        setGeneratedBulkKeys(result.keys)
        toast({
          title: "Success",
          description: `Generated ${result.keys.length} keys`,
          variant: "default",
        })

        // Refresh the key list
        loadKeys()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate keys",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating bulk keys:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating keys",
        variant: "destructive",
      })
    } finally {
      setGeneratingBulkKeys(false)
    }
  }

  // Function to assign credits directly
  async function handleAssignCredits() {
    if (!userId || creditAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid user ID and credit amount",
        variant: "destructive",
      })
      return
    }

    setAssigningCredits(true)

    try {
      const adminId = "7314936460" // Admin user ID
      const result = await adminAssignCredits(userId, creditAmount, adminId, description || undefined)

      if (result.success) {
        toast({
          title: "Success",
          description: `Assigned ${creditAmount} credits to user ${userId}`,
          variant: "default",
        })

        // Clear form
        setCreditAmount(10)
        setDescription("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to assign credits",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error assigning credits:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while assigning credits",
        variant: "destructive",
      })
    } finally {
      setAssigningCredits(false)
    }
  }

  // Function to validate a key
  async function handleValidateKey() {
    if (!keyToValidate) {
      toast({
        title: "Error",
        description: "Please enter a key to validate",
        variant: "destructive",
      })
      return
    }

    setValidatingKey(true)
    setValidationResult(null)

    try {
      const result = await validateKey(keyToValidate)

      setValidationResult(result)

      if (result.success && result.valid) {
        toast({
          title: "Valid Key",
          description: `This key is valid and worth ${result.creditsValue} credits`,
          variant: "default",
        })
      } else {
        toast({
          title: "Invalid Key",
          description: result.message || "This key is not valid",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating key:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while validating key",
        variant: "destructive",
      })
    } finally {
      setValidatingKey(false)
    }
  }

  // Function to look up a user
  async function handleLookupUser() {
    if (!userIdToLookup) {
      toast({
        title: "Error",
        description: "Please enter a user ID to look up",
        variant: "destructive",
      })
      return
    }

    setLookingUpUser(true)
    setUserLookupResult(null)
    setUserTransactions([])

    try {
      // Get user credits
      const creditsResult = await getUserCredits(userIdToLookup)

      if (creditsResult.success) {
        setUserLookupResult(creditsResult)

        // Get user transactions
        const transactionsResult = await getUserTransactions(userIdToLookup)

        if (transactionsResult.success) {
          setUserTransactions(transactionsResult.transactions)
        }

        toast({
          title: "User Found",
          description: `User ${userIdToLookup} has ${creditsResult.credits} credits`,
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: creditsResult.error || "Failed to look up user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error looking up user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while looking up user",
        variant: "destructive",
      })
    } finally {
      setLookingUpUser(false)
    }
  }

  // Function to copy key to clipboard
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setKeyCopied(true)

    toast({
      title: "Copied",
      description: "Key copied to clipboard",
      variant: "default",
    })

    setTimeout(() => setKeyCopied(false), 2000)
  }

  // Function to copy bulk keys to clipboard
  function copyBulkKeysToClipboard() {
    const keysText = generatedBulkKeys
      .map((k) => `${k.key_code} (${k.credits} credits, Type: ${k.key_type})`)
      .join("\n")
    navigator.clipboard.writeText(keysText)

    toast({
      title: "Copied",
      description: "All keys copied to clipboard",
      variant: "default",
    })
  }

  // Function to export keys as CSV
  function exportKeysAsCSV() {
    const headers = ["Key Code", "Type", "Credits", "Status", "Created At", "Used By", "Used At"]
    const csvContent = [
      headers.join(","),
      ...keys.map((key) =>
        [
          key.key_code,
          key.key_type,
          key.credits_value,
          key.is_used ? "Used" : key.is_active ? "Active" : "Inactive",
          new Date(key.created_at).toISOString(),
          key.used_by || "",
          key.used_at ? new Date(key.used_at).toISOString() : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `distribution-keys-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Function to handle back button click
  const handleBackClick = () => {
    router.push("/admin")
  }

  // Function to update bulk key config
  const updateBulkKeyConfig = (keyType: string, field: "count" | "credits", value: number) => {
    setBulkKeyConfig((prev) => ({
      ...prev,
      [keyType]: {
        ...prev[keyType as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBackClick} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Credit Distribution System</h1>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="generate">Generate Keys</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
          <TabsTrigger value="assign">Assign Credits</TabsTrigger>
          <TabsTrigger value="users">User Lookup</TabsTrigger>
          <TabsTrigger value="keys">Manage Keys</TabsTrigger>
        </TabsList>

        {/* Generate Single Key */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate Distribution Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyType">Key Type</Label>
                  <Select value={keyType} onValueChange={setKeyType}>
                    <SelectTrigger id="keyType">
                      <SelectValue placeholder="Select key type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="UNLIMITED">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditsValue">Credits Value</Label>
                  <Input
                    id="creditsValue"
                    type="number"
                    value={creditsValue}
                    onChange={(e) => setCreditsValue(Number.parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>
              </div>

              <Button onClick={handleGenerateKey} disabled={generatingKey} className="w-full">
                {generatingKey ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Key
                  </>
                )}
              </Button>

              {generatedKey && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Generated Key:</Label>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedKey)}>
                      {keyCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <code className="block p-2 bg-gray-200 dark:bg-gray-700 rounded font-mono text-sm break-all">
                    {generatedKey}
                  </code>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    This key is worth <strong>{creditsValue} credits</strong> and has type <strong>{keyType}</strong>.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Key Generation */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Key Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(bulkKeyConfig).map(([type, config]) => (
                  <div key={type} className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">{type} Keys</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${type}-count`}>Count</Label>
                        <Input
                          id={`${type}-count`}
                          type="number"
                          value={config.count}
                          onChange={(e) => updateBulkKeyConfig(type, "count", Number.parseInt(e.target.value) || 0)}
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${type}-credits`}>Credits per Key</Label>
                        <Input
                          id={`${type}-credits`}
                          type="number"
                          value={config.credits}
                          onChange={(e) => updateBulkKeyConfig(type, "credits", Number.parseInt(e.target.value) || 0)}
                          min={1}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleGenerateBulkKeys} disabled={generatingBulkKeys} className="w-full">
                {generatingBulkKeys ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Keys
                  </>
                )}
              </Button>

              {generatedBulkKeys.length > 0 && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Generated Keys ({generatedBulkKeys.length}):</Label>
                    <Button variant="ghost" size="sm" onClick={copyBulkKeysToClipboard}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy All
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {generatedBulkKeys.map((key, index) => (
                      <div key={index} className="p-2 border-b last:border-b-0">
                        <code className="font-mono text-sm break-all">{key.key_code}</code>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({key.credits} credits, Type: {key.key_type})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assign Credits */}
        <TabsContent value="assign">
          <Card>
            <CardHeader>
              <CardTitle>Direct Credit Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter Telegram user ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditAmount">Credit Amount</Label>
                <Input
                  id="creditAmount"
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number.parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for credit assignment"
                />
              </div>

              <Button
                onClick={handleAssignCredits}
                disabled={assigningCredits || !userId || creditAmount <= 0}
                className="w-full"
              >
                {assigningCredits ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Credits"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Key Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={keyToValidate}
                  onChange={(e) => setKeyToValidate(e.target.value)}
                  placeholder="Enter key to validate"
                />
                <Button onClick={handleValidateKey} disabled={validatingKey || !keyToValidate}>
                  {validatingKey ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Validate"}
                </Button>
              </div>

              {validationResult && (
                <div
                  className={`p-4 rounded-md ${
                    validationResult.success && validationResult.valid
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  <p className="font-medium">
                    {validationResult.success && validationResult.valid ? "Valid Key" : "Invalid Key"}
                  </p>
                  <p className="text-sm mt-1">{validationResult.message}</p>
                  {validationResult.success && validationResult.valid && (
                    <div className="mt-2 text-sm">
                      <p>Type: {validationResult.keyType}</p>
                      <p>Credits: {validationResult.creditsValue}</p>
                      <p>Expires: {new Date(validationResult.expiresAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Lookup */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Credit Lookup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={userIdToLookup}
                  onChange={(e) => setUserIdToLookup(e.target.value)}
                  placeholder="Enter Telegram user ID"
                />
                <Button onClick={handleLookupUser} disabled={lookingUpUser || !userIdToLookup}>
                  {lookingUpUser ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {userLookupResult && (
                <div className="mt-4">
                  <h3 className="font-medium text-lg mb-2">User Information</h3>
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                        <p className="font-medium">{userLookupResult.userId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current Credits</p>
                        <p className="font-medium">{userLookupResult.credits}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Received</p>
                        <p className="font-medium">{userLookupResult.totalReceived}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Used</p>
                        <p className="font-medium">{userLookupResult.totalUsed}</p>
                      </div>
                      {userLookupResult.createdAt && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                          <p className="font-medium">{new Date(userLookupResult.createdAt).toLocaleString()}</p>
                        </div>
                      )}
                      {userLookupResult.updatedAt && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                          <p className="font-medium">{new Date(userLookupResult.updatedAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {userTransactions.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium text-lg mb-2">Transaction History</h3>
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {userTransactions.map((transaction) => (
                              <tr key={transaction.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {new Date(transaction.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span
                                    className={
                                      transaction.amount > 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }
                                  >
                                    {transaction.amount > 0 ? "+" : ""}
                                    {transaction.amount}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.transaction_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {transaction.description}
                                  {transaction.key_code && (
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                                      (Key: {transaction.key_code})
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Keys */}
        <TabsContent value="keys">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Distribution Keys</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={loadKeys} disabled={loadingKeys}>
                  <RefreshCw className={`h-4 w-4 ${loadingKeys ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="outline" onClick={exportKeysAsCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="keyTypeFilter">Key Type</Label>
                  <Select
                    value={keyFilters.keyType}
                    onValueChange={(value) => setKeyFilters({ ...keyFilters, keyType: value })}
                  >
                    <SelectTrigger id="keyTypeFilter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem> {/* Updated value prop */}
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="UNLIMITED">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="statusFilter">Status</Label>
                  <Select
                    value={keyFilters.isUsed === undefined ? "" : keyFilters.isUsed ? "used" : "unused"}
                    onValueChange={(value) =>
                      setKeyFilters({
                        ...keyFilters,
                        isUsed: value === "" ? undefined : value === "used",
                      })
                    }
                  >
                    <SelectTrigger id="statusFilter">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="unused">Unused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="activeFilter">Active</Label>
                  <Select
                    value={keyFilters.isActive === undefined ? "" : keyFilters.isActive ? "active" : "inactive"}
                    onValueChange={(value) =>
                      setKeyFilters({
                        ...keyFilters,
                        isActive: value === "" ? undefined : value === "active",
                      })
                    }
                  >
                    <SelectTrigger id="activeFilter">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="searchFilter">Search</Label>
                  <Input
                    id="searchFilter"
                    value={keyFilters.search}
                    onChange={(e) => setKeyFilters({ ...keyFilters, search: e.target.value })}
                    placeholder="Search by key code"
                  />
                </div>
              </div>

              {/* Keys Table */}
              {loadingKeys ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : keys.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No keys found matching your filters.</div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Key Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Used By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {keys.map((key) => (
                        <tr key={key.id}>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{key.key_code}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                key.key_type === "BASIC"
                                  ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                  : key.key_type === "STANDARD"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                    : key.key_type === "PREMIUM"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              }`}
                            >
                              {key.key_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{key.credits_value}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                key.is_used
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  : key.is_active
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {key.is_used ? "Used" : key.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(key.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{key.used_by || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 text-sm text-gray-500">Showing {keys.length} keys</CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
