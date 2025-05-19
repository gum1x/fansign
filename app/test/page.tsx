"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function TestPage() {
  const [activeTab, setActiveTab] = useState("generate")

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden mb-4">
        <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
          <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Testing Mode
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 pb-4">
          <p className="text-center text-gray-300 mb-6">
            Choose a feature to test. All features work without requiring credits or authentication.
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid grid-cols-2 mb-4 bg-gray-800/40">
              <TabsTrigger
                value="generate"
                className="data-[state=active]:bg-purple-700 data-[state=active]:text-white"
              >
                Generate Images
              </TabsTrigger>
              <TabsTrigger value="redeem" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
                Redeem Keys
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <div className="space-y-4">
                <p className="text-sm text-gray-300">Test the image generation feature without requiring credits.</p>
                <Button
                  className="w-full bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-600 hover:to-violet-800 text-white font-medium py-5"
                  asChild
                >
                  <Link href="/generate">Go to Image Generator</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="redeem">
              <div className="space-y-4">
                <p className="text-sm text-gray-300">Test the key redemption feature without requiring real keys.</p>
                <Button
                  className="w-full bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-600 hover:to-violet-800 text-white font-medium py-5"
                  asChild
                >
                  <Link href="/redeem-key">Go to Key Redemption</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="bg-black/60 border-t border-purple-900/30 pt-4">
          <p className="text-xs text-gray-400 text-center w-full">
            Testing mode is enabled. No real credits will be used and no user data will be tracked.
          </p>
        </CardFooter>
      </Card>

      <Card className="w-full max-w-md border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="border-amber-500/50 text-amber-300 hover:bg-amber-900/20 justify-start"
              asChild
            >
              <Link href="/">&larr; Home Page</Link>
            </Button>
            <Button
              variant="outline"
              className="border-amber-500/50 text-amber-300 hover:bg-amber-900/20 justify-start"
              asChild
            >
              <Link href="/generate">&larr; Generate Images</Link>
            </Button>
            <Button
              variant="outline"
              className="border-amber-500/50 text-amber-300 hover:bg-amber-900/20 justify-start"
              asChild
            >
              <Link href="/redeem-key">&larr; Redeem Key</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
