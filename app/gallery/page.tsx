"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ImageIcon, Download, Eye } from "lucide-react"
import Link from "next/link"

const galleryItems = [
  {
    id: 1,
    title: "Classic Illuminated Sign",
    style: "Classic Sign",
    text: "HELLO WORLD",
    image: "/placeholder.svg",
    downloads: 1234,
  },
  {
    id: 2,
    title: "Handwritten Note",
    style: "Handwritten",
    text: "Love you",
    image: "/placeholder.svg",
    downloads: 856,
  },
  {
    id: 3,
    title: "Neon Glow Effect",
    style: "LIV Sign",
    text: "PARTY TIME",
    image: "/placeholder.svg",
    downloads: 2341,
  },
  {
    id: 4,
    title: "Times Square Billboard",
    style: "Times Square",
    text: "Custom Image",
    image: "/placeholder.svg",
    downloads: 567,
  },
  {
    id: 5,
    title: "Cursive Script",
    style: "Double Monkey",
    text: "Beautiful",
    image: "/placeholder.svg",
    downloads: 789,
  },
  {
    id: 6,
    title: "Digital Display",
    style: "LIV Digital",
    text: "TECH VIBES",
    image: "/placeholder.svg",
    downloads: 1456,
  },
]

export default function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<typeof galleryItems[0] | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)]">
          <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-purple-300 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
                Fansign Gallery
              </CardTitle>
              <div className="w-5"></div>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-gradient-to-b from-gray-900/50 to-black/50">
            <div className="mb-6">
              <p className="text-gray-300 text-center">
                Explore amazing fansigns created by our community. Get inspired for your next creation!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 rounded-lg border border-purple-700/30 overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-purple-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-purple-300 mb-2">{item.style}</p>
                    <p className="text-sm text-gray-400 mb-3">"{item.text}"</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{item.downloads} downloads</span>
                      <Button size="sm" variant="outline" className="border-purple-700/50 text-purple-300">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button asChild className="bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950">
                <Link href="/generate">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Create Your Own Fansign
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal for viewing selected item */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
            <div className="bg-gray-900 rounded-lg border border-purple-700/50 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedItem.title}</h3>
                  <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                    ×
                  </Button>
                </div>
                <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                  <ImageIcon className="w-16 h-16 text-purple-400" />
                </div>
                <div className="space-y-2 mb-4">
                  <p><span className="text-purple-300">Style:</span> {selectedItem.style}</p>
                  <p><span className="text-purple-300">Text:</span> "{selectedItem.text}"</p>
                  <p><span className="text-purple-300">Downloads:</span> {selectedItem.downloads}</p>
                </div>
                <div className="flex space-x-4">
                  <Button className="flex-1 bg-green-700 hover:bg-green-600">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button asChild variant="outline" className="flex-1 border-purple-700/50">
                    <Link href="/generate">
                      Create Similar
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}