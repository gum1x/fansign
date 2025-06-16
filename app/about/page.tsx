"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ImageIcon, Sparkles, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
                About Fansign Generator
              </CardTitle>
              <div className="w-5"></div>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-gradient-to-b from-gray-900/50 to-black/50 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
                Create Amazing Fansigns with AI
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Our advanced AI-powered platform makes it easy to create professional-looking fansigns with realistic handwriting, lighting effects, and custom styling.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">AI-Powered</h3>
                <p className="text-gray-400">
                  Advanced algorithms create realistic handwriting and lighting effects that look natural and authentic.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Lightning Fast</h3>
                <p className="text-gray-400">
                  Generate high-quality fansigns in seconds. No waiting, no complicated setup - just instant results.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Community Driven</h3>
                <p className="text-gray-400">
                  Join thousands of creators sharing their amazing fansigns and inspiring each other.
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-700/30">
              <h3 className="text-xl font-semibold mb-4 text-purple-300">Available Styles</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "Classic Illuminated Signs",
                  "Handwritten Notes",
                  "Digital LED Displays",
                  "Times Square Billboards",
                  "Cursive Script",
                  "Neon Glow Effects",
                  "Marker Writing",
                  "Custom Image Overlays"
                ].map((style, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">{style}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 rounded-lg border border-purple-700/30">
              <h3 className="text-xl font-semibold mb-4 text-white">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-white">Choose Your Style</h4>
                    <p className="text-gray-400">Select from our collection of professionally designed templates.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-white">Customize</h4>
                    <p className="text-gray-400">Add your text or upload images. Our AI handles the rest.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-white">Download & Share</h4>
                    <p className="text-gray-400">Get your high-quality fansign instantly and share it anywhere.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-white">Ready to Get Started?</h3>
              <p className="text-gray-400 mb-6">
                Join thousands of users creating amazing fansigns every day.
              </p>
              <Button asChild className="bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950">
                <Link href="/generate">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Create Your First Fansign
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}