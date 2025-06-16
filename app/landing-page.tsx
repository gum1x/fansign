"use client"

import Link from "next/link"
import { Download, ExternalLink, ImageIcon, PenTool, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Custom Fansign Generator
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
            Create personalized fansigns instantly with our powerful AI generator. Choose from multiple styles and customize your perfect sign.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg">
              <Link href="/generate">
                <ImageIcon className="w-5 h-5 mr-2" />
                Create Fansign Now
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-900/20 px-8 py-4 text-lg">
              <Link href="/gallery">
                <ExternalLink className="w-5 h-5 mr-2" />
                View Gallery
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-700/30 shadow-lg">
              <div className="w-12 h-12 bg-purple-700/30 rounded-full flex items-center justify-center mb-4">
                <PenTool className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">1. Choose Template</h3>
              <p className="text-gray-300">
                Select from multiple templates including illuminated signs, handwritten styles, and digital displays.
              </p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-700/30 shadow-lg">
              <div className="w-12 h-12 bg-purple-700/30 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">2. Customize</h3>
              <p className="text-gray-300">
                Add your text or upload images. Our AI creates realistic effects with handwriting, lighting, and textures.
              </p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-700/30 shadow-lg">
              <div className="w-12 h-12 bg-purple-700/30 rounded-full flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">3. Download & Share</h3>
              <p className="text-gray-300">
                Download your custom fansign in high quality or share it directly with friends and followers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Styles Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Available Styles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Classic Sign", desc: "Illuminated letters" },
              { name: "Handwritten", desc: "Natural writing style" },
              { name: "Digital Display", desc: "LED screen effect" },
              { name: "Billboard", desc: "Times Square style" },
              { name: "Neon Sign", desc: "Glowing neon effect" },
              { name: "Cursive", desc: "Elegant script" },
              { name: "Marker", desc: "Bold marker style" },
              { name: "Custom", desc: "Upload your images" },
            ].map((style, index) => (
              <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-purple-700/30 text-center">
                <div className="w-full h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-md mb-3 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{style.name}</h3>
                <p className="text-sm text-gray-400">{style.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Create Your Fansign?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of users creating amazing custom fansigns every day.
          </p>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg">
            <Link href="/generate">
              <ImageIcon className="w-5 h-5 mr-2" />
              Start Creating Now
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-black border-t border-purple-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Fansign Generator</h3>
              <p className="text-gray-400">Create custom fansigns with AI-powered text and image processing.</p>
            </div>
            <div>
              <h4 className="text-md font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/generate" className="text-gray-400 hover:text-purple-400">Create Fansign</Link></li>
                <li><Link href="/gallery" className="text-gray-400 hover:text-purple-400">Gallery</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-purple-400">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-purple-400">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-purple-400">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-900/30 mt-8 pt-8 text-center">
            <p className="text-gray-400">© {new Date().getFullYear()} Fansign Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}