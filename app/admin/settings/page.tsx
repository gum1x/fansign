"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    enableKeySystem: true,
    enableFreeGeneration: false,
    maxFreeGenerations: 3,
    defaultKeyExpiration: 30, // days
  })

  // Function to handle back button click
  const handleBackClick = () => {
    router.push("/admin")
  }

  // Function to save settings
  const saveSettings = async () => {
    setIsLoading(true)

    try {
      // In a real app, this would save to the database
      // For now, we'll just simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <Card className="w-full max-w-2xl mx-auto border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={handleBackClick} className="text-purple-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              System Settings
            </CardTitle>
            <div className="w-5"></div> {/* Empty div for alignment */}
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-300">Key System Settings</h2>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableKeySystem" className="text-white">
                    Enable Key System
                  </Label>
                  <p className="text-sm text-gray-400">Turn the key system on or off</p>
                </div>
                <Switch
                  id="enableKeySystem"
                  checked={settings.enableKeySystem}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableKeySystem: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableFreeGeneration" className="text-white">
                    Enable Free Generations
                  </Label>
                  <p className="text-sm text-gray-400">Allow users to generate images without a key</p>
                </div>
                <Switch
                  id="enableFreeGeneration"
                  checked={settings.enableFreeGeneration}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableFreeGeneration: checked })}
                />
              </div>

              <div>
                <Label htmlFor="maxFreeGenerations" className="text-white">
                  Max Free Generations
                </Label>
                <p className="text-sm text-gray-400 mb-2">Maximum number of free generations per user</p>
                <Input
                  id="maxFreeGenerations"
                  type="number"
                  value={settings.maxFreeGenerations}
                  onChange={(e) =>
                    setSettings({ ...settings, maxFreeGenerations: Number.parseInt(e.target.value) || 0 })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="defaultKeyExpiration" className="text-white">
                  Default Key Expiration (Days)
                </Label>
                <p className="text-sm text-gray-400 mb-2">Default expiration period for new keys</p>
                <Input
                  id="defaultKeyExpiration"
                  type="number"
                  value={settings.defaultKeyExpiration}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultKeyExpiration: Number.parseInt(e.target.value) || 30 })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <Button
                onClick={saveSettings}
                className="bg-gradient-to-r from-purple-600 to-violet-800 hover:from-purple-500 hover:to-violet-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
