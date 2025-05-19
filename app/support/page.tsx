"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SupportButton } from "@/components/support-button"

export default function SupportPage() {
  const [message, setMessage] = useState("")
  const [telegramId, setTelegramId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)

    try {
      // Here we would integrate with your supportActions
      // For now, let's just simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Message sent",
        description: "We've received your support request and will respond soon.",
        variant: "default",
      })

      setMessage("")
    } catch (error) {
      console.error("Error sending support message:", error)
      toast({
        title: "Error sending message",
        description: "Please try again later or contact us directly on Telegram.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto pt-8 pb-16">
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
          Customer Support
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-gray-900/50 border-purple-900/30">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="telegramId" className="block text-sm font-medium text-gray-300 mb-1">
                      Telegram ID or Username (optional)
                    </label>
                    <Input
                      id="telegramId"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      placeholder="e.g. @username or 123456789"
                      className="bg-gray-800/40 border-purple-900/50 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue or question in detail..."
                      className="min-h-[120px] bg-gray-800/40 border-purple-900/50 focus:border-purple-500 resize-none"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gray-900/50 border-purple-900/30">
              <CardHeader>
                <CardTitle>Direct Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Need immediate assistance? Contact us directly through our Telegram bot.
                </p>
              </CardContent>
              <CardFooter>
                <SupportButton />
              </CardFooter>
            </Card>

            <Card className="bg-gray-900/50 border-purple-900/30 mt-6">
              <CardHeader>
                <CardTitle>FAQs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-purple-300 mb-1">How do I generate a fansign?</h3>
                  <p className="text-sm text-gray-300">
                    Go to the Generate page, select a template, enter your text, and click Generate.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-purple-300 mb-1">How do I redeem an API key?</h3>
                  <p className="text-sm text-gray-300">
                    Visit the Redeem page and enter your API key to access premium features.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-purple-300 mb-1">Why can't I download my image?</h3>
                  <p className="text-sm text-gray-300">
                    Try using the "Generate Link" button and open the link in your browser.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
