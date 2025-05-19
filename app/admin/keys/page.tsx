"use client"

import { useState, useEffect } from "react"
import { generateMultipleKeys, getAllKeys } from "@/app/actions/keyActions"

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedKeys, setGeneratedKeys] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load keys on mount
  useEffect(() => {
    loadKeys()
  }, [])

  // Function to load all keys
  async function loadKeys() {
    setLoading(true)
    setError(null)

    try {
      const result = await getAllKeys()

      if (result.success) {
        setKeys(result.keys)
      } else {
        setError(result.error || "Failed to load keys")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      console.error("Error loading keys:", err)
    } finally {
      setLoading(false)
    }
  }

  // Function to generate the requested keys
  async function handleGenerateKeys() {
    setGenerating(true)
    setError(null)

    try {
      const result = await generateMultipleKeys()

      if (result.success) {
        setGeneratedKeys(result.keys)
        // Reload the keys list
        await loadKeys()
      } else {
        setError(result.error || "Failed to generate keys")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      console.error("Error generating keys:", err)
    } finally {
      setGenerating(false)
    }
  }

  // Function to copy keys to clipboard
  function copyKeysToClipboard() {
    const keysText = generatedKeys.map((k) => `${k.key} (${k.allowance} generations, Type: ${k.type})`).join("\n")
    navigator.clipboard.writeText(keysText)
    alert("Keys copied to clipboard!")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Key Management</h1>

      {/* Key Generation Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate New Keys</h2>
        <p className="mb-4">This will generate 10 keys with the following specifications:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>1 key with 1 generation (BASIC)</li>
          <li>1 key with 5 generations (STANDARD)</li>
          <li>1 key with 999 generations (UNLIMITED)</li>
          <li>7 keys with random generation allowances between 1-100</li>
        </ul>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          onClick={handleGenerateKeys}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate Keys"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {generatedKeys.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Generated Keys:</h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border">
              {generatedKeys.map((key, index) => (
                <div key={index} className="mb-1 font-mono">
                  {key.key}{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    ({key.allowance} generations, Type: {key.type})
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800" onClick={copyKeysToClipboard}>
              Copy All Keys
            </button>
          </div>
        )}
      </div>

      {/* Keys Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">All Keys</h2>

        {loading ? (
          <div className="p-6 text-center">Loading keys...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 dark:text-red-400">Error: {error}</div>
        ) : keys.length === 0 ? (
          <div className="p-6 text-center">No keys found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Key Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Generations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expires
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">{key.key_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {key.generations_used} / {key.generations_allowed}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
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
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(key.expires_at).toLocaleDateString()}
                      {new Date(key.expires_at) < new Date() && (
                        <span className="ml-2 text-red-500 dark:text-red-400">(Expired)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
