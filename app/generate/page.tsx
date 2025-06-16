"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, Upload, RefreshCw, ImageIcon, Save, Trash2, Sparkles, Zap, Star, Heart, CreditCard } from "lucide-react"
import Link from "next/link"
import { processSignImage } from "@/utils/processSignImage"
import { processBophouseImage } from "@/utils/processBophouseImage"
import { processBophouseNewImage } from "@/utils/processBophouseNewImage"
import { processLivImage } from "@/utils/processLivImage"
import { processLivDigitalImage } from "@/utils/processLivDigitalImage"
import { processPoppyImage } from "@/utils/processPoppyImage"
import { processBootyImage } from "@/utils/processBootyImage"
import { processDoubleMonkeyImage } from "@/utils/processDoubleMonkeyImage"
import { processThreeCatsImage } from "@/utils/processThreeCatsImage"
import { processTimesSquareImage } from "@/utils/processTimesSquareImage"
import { processTimesSquareNewImage } from "@/utils/processTimesSquareNewImage"
import { authService } from "@/lib/auth"
import { GENERATION_COSTS } from "@/lib/config"
import type { AuthUser } from "@/lib/auth"

const signOptions = [
  {
    id: "sign",
    name: "Classic Sign",
    processor: processSignImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1047.JPG-eUk9CLgdVSnDP6Q2CWWt0ahox0GZEn.jpeg",
    category: "illuminated",
    popular: true
  },
  {
    id: "bophouse",
    name: "Bophouse",
    processor: processBophouseImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1064.JPG-fIkmk9Jp6D6OZHlDhoxgpeUDAHzI3w.jpeg",
    category: "handwritten",
    popular: false
  },
  {
    id: "bophouse-new",
    name: "Bophouse New",
    processor: processBophouseNewImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1136.JPG-45Dhw5868FFua9u5UQT8VTJ81BKpfq.jpeg",
    category: "handwritten",
    popular: false
  },
  {
    id: "liv",
    name: "LIV Sign",
    processor: processLivImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1076.JPG-VQMAwjnByZX1oMtvD1Dnwu0A6W90L4.jpeg",
    category: "digital",
    popular: true
  },
  {
    id: "liv-digital",
    name: "LIV Digital",
    processor: processLivDigitalImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1112.JPG-ycFJnZXtoG4d3vQ9BVrXLhIF7NXxgr.jpeg",
    category: "digital",
    popular: false
  },
  {
    id: "poppy",
    name: "Poppy Sign",
    processor: processPoppyImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "/images/poppy-template.jpeg",
    category: "illuminated",
    popular: false
  },
  {
    id: "booty",
    name: "Booty Sign",
    processor: processBootyImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "/images/booty-template.jpeg",
    category: "handwritten",
    popular: true
  },
  {
    id: "double-monkey",
    name: "Double Monkey",
    processor: processDoubleMonkeyImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-05%20at%2010.jpg-S12CeanADthNRBsbZztHcKmgSilm0S.jpeg",
    category: "handwritten",
    popular: false
  },
  {
    id: "three-cats",
    name: "Three Cats",
    processor: processThreeCatsImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-04-16_03-03-06.jpg-zTOcfTscZ9yF9I0lS86inZ59NpBRAN.jpeg",
    category: "handwritten",
    popular: false
  },
  {
    id: "times-square",
    name: "Times Square",
    processor: processTimesSquareImage,
    requiresText: false,
    maxImages: 1,
    previewImage: "/images/times-square-billboard.jpeg",
    category: "billboard",
    popular: true
  },
  {
    id: "times-square-new",
    name: "Times Square Dual",
    processor: processTimesSquareNewImage,
    requiresText: false,
    maxImages: 2,
    previewImage: "/images/times-square-billboard-new.jpeg",
    category: "billboard",
    popular: false
  },
]

const categories = [
  { id: "all", name: "All Styles", icon: Sparkles },
  { id: "illuminated", name: "Illuminated", icon: Zap },
  { id: "handwritten", name: "Handwritten", icon: Heart },
  { id: "digital", name: "Digital", icon: Star },
  { id: "billboard", name: "Billboard", icon: ImageIcon },
]

export default function GeneratePage() {
  const [selectedSign, setSelectedSign] = useState(signOptions[0])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [text, setText] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [savedImages, setSavedImages] = useState<Array<{id: string, image: string, style: string, text: string, timestamp: number}>>([])
  const [showParticles, setShowParticles] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load user and saved images on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    const saved = localStorage.getItem('savedFansigns')
    if (saved) {
      try {
        setSavedImages(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading saved images:', e)
      }
    }
  }, [])

  // Save to localStorage whenever savedImages changes
  useEffect(() => {
    localStorage.setItem('savedFansigns', JSON.stringify(savedImages))
  }, [savedImages])

  // Security: Disable right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }, [])

  // Security: Disable drag and drop
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    return false
  }, [])

  const filteredSignOptions = selectedCategory === "all" 
    ? signOptions 
    : signOptions.filter(option => option.category === selectedCategory)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        const newImages = [...uploadedImages]
        newImages[index] = result
        setUploadedImages(newImages)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!user) {
      alert("Please log in to generate fansigns")
      return
    }

    if (selectedSign.requiresText && !text.trim()) {
      alert("Please enter some text for your fansign")
      return
    }

    if (selectedSign.maxImages > 0 && uploadedImages.filter(Boolean).length === 0) {
      alert("Please upload at least one image")
      return
    }

    // Check credit cost
    const creditCost = GENERATION_COSTS[selectedSign.id as keyof typeof GENERATION_COSTS] || 1
    
    if (user.credits < creditCost) {
      alert(`Insufficient credits. This style costs ${creditCost} credits. You have ${user.credits} credits.`)
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)
    setShowParticles(true)

    try {
      // Deduct credits first
      const deductResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          style: selectedSign.id,
          textContent: text,
          imageUrl: uploadedImages[0] || null
        }),
      })

      const deductData = await deductResponse.json()

      if (!deductResponse.ok) {
        if (deductResponse.status === 402) {
          alert(`Insufficient credits. This style costs ${deductData.required} credits. You have ${deductData.available} credits.`)
          return
        }
        throw new Error(deductData.error || 'Failed to process payment')
      }

      // Update user credits locally
      const updatedUser = { ...user, credits: deductData.remainingCredits }
      setUser(updatedUser)

      // Generate the image
      let result: string | false

      if (selectedSign.id === "times-square") {
        result = await processTimesSquareImage(uploadedImages[0] || null, canvasRef)
      } else if (selectedSign.id === "times-square-new") {
        result = await processTimesSquareNewImage(
          uploadedImages[0] || null,
          uploadedImages[1] || null,
          canvasRef
        )
      } else if (selectedSign.id === "liv") {
        result = await processLivImage(text, canvasRef, "Arial")
      } else {
        result = await selectedSign.processor(text, canvasRef)
      }

      if (result) {
        setGeneratedImage(result)
        setTimeout(() => setShowParticles(false), 2000)
      } else {
        alert("Failed to generate image. Please try again.")
        setShowParticles(false)
      }
    } catch (error) {
      console.error("Error generating image:", error)
      alert("An error occurred while generating the image. Please try again.")
      setShowParticles(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `fansign-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSave = () => {
    if (!generatedImage) return

    const newSave = {
      id: Date.now().toString(),
      image: generatedImage,
      style: selectedSign.name,
      text: text || "Custom Image",
      timestamp: Date.now()
    }

    setSavedImages(prev => [newSave, ...prev.slice(0, 9)]) // Keep only 10 most recent
    
    // Show success animation
    const button = document.querySelector('[data-save-button]') as HTMLElement
    if (button) {
      button.style.transform = 'scale(0.95)'
      setTimeout(() => {
        button.style.transform = 'scale(1)'
      }, 150)
    }
  }

  const handleDeleteSaved = (id: string) => {
    setSavedImages(prev => prev.filter(item => item.id !== id))
  }

  const handleReset = () => {
    setText("")
    setUploadedImages([])
    setGeneratedImage(null)
  }

  const getCreditCost = () => {
    return GENERATION_COSTS[selectedSign.id as keyof typeof GENERATION_COSTS] || 1
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full opacity-5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-500 rounded-full opacity-5 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500 rounded-full opacity-3 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Success particles */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(138,43,226,0.6)] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-800 via-purple-800 to-pink-800 border-b border-purple-700/50 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-pink-600/20 animate-pulse"></div>
              <div className="relative flex items-center justify-between">
                <Link href="/" className="text-purple-300 hover:text-white transition-all duration-300 hover:scale-110">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <CardTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-violet-400 animate-pulse">
                  ✨ Create Your Fansign ✨
                </CardTitle>
                <div className="flex items-center space-x-4">
                  {user && (
                    <div className="flex items-center px-3 py-1 bg-purple-900/30 rounded-full border border-purple-700/50">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                      <span className="text-purple-300 text-sm">{user.credits} credits</span>
                    </div>
                  )}
                  <Link href="/purchase" className="text-purple-300 hover:text-white transition-colors">
                    <CreditCard className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 bg-gradient-to-b from-gray-900/60 to-black/60">
              <div className="grid lg:grid-cols-12 gap-0 min-h-[80vh]">
                {/* Style Selection - Full Height Sidebar */}
                <div className="lg:col-span-4 border-r border-purple-700/30 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
                  <div className="p-6 border-b border-purple-700/30">
                    <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Available Styles
                    </h3>
                    
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {categories.map((category) => {
                        const Icon = category.icon
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                              selectedCategory === category.id
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                            }`}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {category.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Styles Grid */}
                  <div className="p-6 max-h-[calc(80vh-200px)] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                      {filteredSignOptions.map((option) => {
                        const creditCost = GENERATION_COSTS[option.id as keyof typeof GENERATION_COSTS] || 1
                        return (
                          <div
                            key={option.id}
                            className={`relative group cursor-pointer transition-all duration-300 ${
                              selectedSign.id === option.id
                                ? "transform scale-105"
                                : "hover:scale-102"
                            }`}
                            onClick={() => setSelectedSign(option)}
                          >
                            <div
                              className={`relative p-4 rounded-xl border transition-all duration-300 ${
                                selectedSign.id === option.id
                                  ? "bg-gradient-to-br from-purple-700/40 to-pink-700/40 border-purple-400 shadow-lg shadow-purple-500/30"
                                  : "bg-gray-800/50 border-purple-900/30 hover:bg-gray-800/70 hover:border-purple-700/50 hover:shadow-lg hover:shadow-purple-500/20"
                              }`}
                            >
                              {/* Popular badge */}
                              {option.popular && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                  ⭐ Popular
                                </div>
                              )}

                              {/* Credit cost badge */}
                              <div className="absolute -top-2 -left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                {creditCost} credit{creditCost > 1 ? 's' : ''}
                              </div>

                              <div 
                                className="flex items-center justify-center w-full h-20 bg-gray-700/30 rounded-lg mb-3 overflow-hidden relative"
                                onContextMenu={handleContextMenu}
                                onDragStart={handleDragStart}
                              >
                                <img 
                                  src={option.previewImage} 
                                  alt={option.name}
                                  className="w-full h-full object-cover rounded-lg select-none pointer-events-none transition-transform duration-300 group-hover:scale-110"
                                  draggable={false}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<svg class="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>';
                                    }
                                  }}
                                />
                                {selectedSign.id === option.id && (
                                  <div className="absolute inset-0 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-lg">✓</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <h4 className="font-semibold text-white text-center text-sm">{option.name}</h4>
                              {option.maxImages > 0 && (
                                <p className="text-xs text-purple-300 text-center mt-1">
                                  {option.maxImages} image{option.maxImages > 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Customization Panel */}
                <div className="lg:col-span-4 border-r border-purple-700/30 bg-gradient-to-b from-gray-800/30 to-gray-900/30">
                  <div className="p-6 h-full flex flex-col">
                    <h3 className="text-xl font-semibold text-purple-300 mb-6 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Customize {selectedSign.name}
                    </h3>

                    {/* Credit cost display */}
                    <div className="mb-6 p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 text-sm">Generation Cost:</span>
                        <div className="flex items-center">
                          <Sparkles className="w-4 h-4 mr-1 text-purple-400" />
                          <span className="text-purple-300 font-semibold">{getCreditCost()} credit{getCreditCost() > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      {user && user.credits < getCreditCost() && (
                        <div className="mt-2 text-red-400 text-sm">
                          ⚠️ Insufficient credits. You need {getCreditCost() - user.credits} more credits.
                        </div>
                      )}
                    </div>

                    <div className="space-y-6 flex-1">
                      {selectedSign.requiresText && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-300 flex items-center">
                            <Heart className="w-4 h-4 mr-2 text-pink-400" />
                            Enter your text:
                          </label>
                          <div className="relative">
                            <Textarea
                              placeholder="Type your message here..."
                              value={text}
                              onChange={(e) => setText(e.target.value)}
                              className="bg-gray-800/60 border-purple-700/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20"
                              rows={4}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                              {text.length}/50
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 bg-gray-800/30 p-2 rounded">
                            💡 {selectedSign.id === "bophouse-new"
                              ? "Works best with exactly 2 words"
                              : "Keep it short for best results (1-3 words recommended)"}
                          </p>
                        </div>
                      )}

                      {selectedSign.maxImages > 0 && (
                        <div className="space-y-4">
                          {Array.from({ length: selectedSign.maxImages }, (_, index) => (
                            <div key={index} className="space-y-3">
                              <label className="text-sm font-medium text-gray-300 flex items-center">
                                <ImageIcon className="w-4 h-4 mr-2 text-blue-400" />
                                Upload Image {selectedSign.maxImages > 1 ? `${index + 1}` : ""}:
                              </label>
                              <div className="space-y-3">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, index)}
                                  className="hidden"
                                  id={`image-upload-${index}`}
                                />
                                <label
                                  htmlFor={`image-upload-${index}`}
                                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-700/80 to-pink-700/80 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 w-full"
                                >
                                  <Upload className="w-4 h-4" />
                                  <span>Choose Image</span>
                                </label>
                                {uploadedImages[index] && (
                                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-green-500/30 animate-pulse">
                                    <img
                                      src={uploadedImages[index]}
                                      alt={`Upload ${index + 1}`}
                                      className="w-16 h-16 object-cover rounded border border-purple-700/50 select-none pointer-events-none"
                                      draggable={false}
                                      onContextMenu={handleContextMenu}
                                    />
                                    <span className="text-sm text-green-400 flex-1">✓ Image uploaded successfully</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <Button
                        onClick={handleGenerate}
                        disabled={
                          isGenerating ||
                          !user ||
                          (user.credits < getCreditCost()) ||
                          (selectedSign.requiresText && !text.trim()) ||
                          (selectedSign.maxImages > 0 && uploadedImages.filter(Boolean).length === 0)
                        }
                        className="flex-1 bg-gradient-to-r from-purple-700 via-pink-700 to-violet-700 hover:from-purple-800 hover:via-pink-800 hover:to-violet-800 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : !user ? (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Login Required
                          </>
                        ) : user.credits < getCreditCost() ? (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Need Credits
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate ({getCreditCost()} credit{getCreditCost() > 1 ? 's' : ''})
                          </>
                        )}
                      </Button>

                      <Button 
                        onClick={handleReset} 
                        variant="outline" 
                        className="border-purple-700/50 hover:bg-purple-900/20 transition-all duration-300 hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {!user && (
                      <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                        <p className="text-blue-300 text-sm text-center">
                          <Link href="/auth" className="underline hover:text-blue-200">
                            Sign in or create an account
                          </Link> to start generating fansigns
                        </p>
                      </div>
                    )}

                    {user && user.credits < getCreditCost() && (
                      <div className="mt-4 p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg">
                        <p className="text-orange-300 text-sm text-center">
                          <Link href="/purchase" className="underline hover:text-orange-200">
                            Purchase more credits
                          </Link> to continue generating fansigns
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Result Panel */}
                <div className="lg:col-span-4 bg-gradient-to-b from-gray-800/30 to-gray-900/30">
                  <div className="p-6 h-full flex flex-col">
                    <h3 className="text-xl font-semibold text-purple-300 mb-6 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Your Fansign
                    </h3>

                    {generatedImage ? (
                      <div className="space-y-4 flex-1 flex flex-col">
                        <div 
                          className="border border-purple-700/50 rounded-xl overflow-hidden bg-gray-800/30 relative group flex-1 flex items-center justify-center"
                          onContextMenu={handleContextMenu}
                          onDragStart={handleDragStart}
                        >
                          <img
                            src={generatedImage}
                            alt="Generated fansign"
                            className="max-w-full max-h-full object-contain select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
                            draggable={false}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            onClick={handleDownload}
                            className="flex-1 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>

                          <Button
                            onClick={handleSave}
                            variant="outline"
                            className="border-purple-700/50 hover:bg-purple-900/20 transition-all duration-300 hover:scale-105"
                            data-save-button
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-purple-700/30 rounded-xl p-8 text-center flex-1 flex flex-col items-center justify-center">
                        <div className="animate-pulse">
                          <ImageIcon className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                          <p className="text-gray-400">Your generated fansign will appear here</p>
                          <p className="text-xs text-gray-500 mt-2">✨ Magic happens when you click Generate ✨</p>
                        </div>
                      </div>
                    )}

                    {/* Saved Images */}
                    {savedImages.length > 0 && (
                      <div className="mt-6 border-t border-purple-700/30 pt-6">
                        <h4 className="text-lg font-semibold text-purple-300 mb-4 flex items-center">
                          <Heart className="w-4 h-4 mr-2" />
                          Saved Fansigns ({savedImages.length})
                        </h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                          {savedImages.map((saved) => (
                            <div key={saved.id} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300 group">
                              <img
                                src={saved.image}
                                alt={saved.style}
                                className="w-12 h-12 object-cover rounded border border-purple-700/50 select-none pointer-events-none group-hover:scale-110 transition-transform duration-300"
                                draggable={false}
                                onContextMenu={handleContextMenu}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{saved.style}</p>
                                <p className="text-xs text-gray-400 truncate">{saved.text}</p>
                                <p className="text-xs text-gray-500">{new Date(saved.timestamp).toLocaleDateString()}</p>
                              </div>
                              <Button
                                onClick={() => handleDeleteSaved(saved.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-700/50 text-red-400 hover:bg-red-900/20 transition-all duration-300 hover:scale-110"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.8);
        }
      `}</style>
    </div>
  )
}