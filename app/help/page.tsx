"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ChevronDown, ChevronRight, HelpCircle, MessageCircle } from "lucide-react"
import Link from "next/link"

const faqItems = [
  {
    question: "How do I create a fansign?",
    answer: "Simply go to the Generate page, choose your preferred style, add your text or upload images, and click Generate. Your fansign will be ready in seconds!"
  },
  {
    question: "What image formats are supported?",
    answer: "We support JPG, PNG, and GIF formats. For best results, use high-resolution images (at least 1000x1000 pixels)."
  },
  {
    question: "Can I use my own images?",
    answer: "Yes! Some styles like Times Square Billboard allow you to upload your own images. Just click the upload button and select your image."
  },
  {
    question: "How many words can I use?",
    answer: "This depends on the style. Most text-based styles work best with 1-3 words, but you can experiment to see what looks best."
  },
  {
    question: "Can I download my fansign?",
    answer: "Absolutely! Once your fansign is generated, you can download it in high quality JPG format."
  },
  {
    question: "Are there any usage restrictions?",
    answer: "You can use your generated fansigns for personal use. Please respect copyright when uploading images and avoid inappropriate content."
  },
  {
    question: "Why isn't my text showing up properly?",
    answer: "Make sure your text isn't too long for the selected style. Try shorter phrases or switch to a style that supports longer text."
  },
  {
    question: "Can I edit my fansign after generating it?",
    answer: "Currently, you'll need to generate a new fansign with your changes. We're working on an edit feature for future updates!"
  }
]

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)]">
          <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-purple-300 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
                Help Center
              </CardTitle>
              <div className="w-5"></div>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-gradient-to-b from-gray-900/50 to-black/50 space-y-8">
            <div className="text-center">
              <HelpCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4 text-white">How can we help you?</h2>
              <p className="text-gray-300">
                Find answers to common questions about creating and customizing your fansigns.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-300 mb-4">Frequently Asked Questions</h3>
              
              {faqItems.map((item, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg border border-purple-700/30 overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                  >
                    <span className="font-medium text-white">{item.question}</span>
                    {openItems.includes(index) ? (
                      <ChevronDown className="w-5 h-5 text-purple-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-purple-400" />
                    )}
                  </button>
                  
                  {openItems.includes(index) && (
                    <div className="px-4 pb-4 border-t border-purple-700/30">
                      <p className="text-gray-300 pt-4">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 rounded-lg border border-purple-700/30">
              <h3 className="text-xl font-semibold mb-4 text-white">Quick Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <p className="text-gray-300">Keep text short and simple for best results</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <p className="text-gray-300">Use high-resolution images when uploading</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <p className="text-gray-300">Try different styles to find what works best</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <p className="text-gray-300">Download your fansign immediately after generation</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-white">Still Need Help?</h3>
              <p className="text-gray-400 mb-6">
                Can't find what you're looking for? Get in touch with our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" className="border-purple-700/50">
                  <Link href="/contact">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950">
                  <Link href="/generate">
                    Start Creating
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}