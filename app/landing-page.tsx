"use client"

import Link from "next/link"
import { Download, ExternalLink, ImageIcon, PenTool } from "lucide-react"

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
            Create personalized fansigns instantly with our powerful generator
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              <ImageIcon className="w-5 h-5 mr-2 inline" />
              Create Fansign
            </button>
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
                Select from multiple templates and customize your text to create the perfect fansign.
              </p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-700/30 shadow-lg">
              <div className="w-12 h-12 bg-purple-700/30 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">2. Generate Image</h3>
              <p className="text-gray-300">
                Our AI-powered generator creates your custom fansign with realistic handwriting effects.
              </p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-700/30 shadow-lg">
              <div className="w-12 h-12 bg-purple-700/30 rounded-full flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">3. Download & Share</h3>
              <p className="text-gray-300">
                Download your custom fansign or generate a shareable link to send to friends and followers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Previews Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            See Our Latest Fansigns
          </h2>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <ExternalLink className="w-5 h-5 mr-2 inline" />
            View Previews on Telegram
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-black border-t border-purple-900/30">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Fansign Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}