"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, Upload, RefreshCw, ImageIcon, Save, Trash2 } from "lucide-react"
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

const signOptions = [
  {
    id: "sign",
    name: "Classic Sign",
    processor: processSignImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1047.JPG-eUk9CLgdVSnDP6Q2CWWt0ahox0GZEn.jpeg"
  },
  {
    id: "bophouse",
    name: "Bophouse",
    processor: processBophouseImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1064.JPG-fIkmk9Jp6D6OZHlDhoxgpeUDAHzI3w.jpeg"
  },
  {
    id: "bophouse-new",
    name: "Bophouse New",
    processor: processBophouseNewImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1136.JPG-45Dhw5868FFua9u5UQT8VTJ81BKpfq.jpeg"
  },
  {
    id: "liv",
    name: "LIV Sign",
    processor: processLivImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1076.JPG-VQMAwjnByZX1oMtvD1Dnwu0A6W90L4.jpeg"
  },
  {
    id: "liv-digital",
    name: "LIV Digital",
    processor: processLivDigitalImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1112.JPG-ycFJnZXtoG4d3vQ9BVrXLhIF7NXxgr.jpeg"
  },
  {
    id: "poppy",
    name: "Poppy Sign",
    processor: processPoppyImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "/images/poppy-template.jpeg"
  },
  {
    id: "booty",
    name: "Booty Sign",
    processor: processBootyImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "/images/booty-template.jpeg"
  },
  {
    id: "double-monkey",
    name: "Double Monkey",
    processor: processDoubleMonkeyImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-05%20at%2010.jpg-S12CeanADthNRBsbZztHcKmgSilm0S.jpeg"
  },
  {
    id: "three-cats",
    name: "Three Cats",
    processor: processThreeCatsImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-04-16_03-03-06.jpg-zTOcfTscZ9yF9I0lS86inZ59NpBRAN.jpeg"
  },
  {
    id: "times-square",
    name: "Times Square",
    processor: processTimesSquareImage,
    requiresText: false,
    maxImages: 1,
    previewImage: "/images/times-square-billboard.jpeg"
  },
  {
    id: "times-square-new",
    name: "Times Square Dual",
    processor: processTimesSquareNewImage,
    requiresText: false,
    maxImages: 2,
    previewImage: "/images/times-square-billboard-new.jpeg"
  },
]

export default function GeneratePage() {
  const [selectedSign, setSelectedSign] = useState(signOptions[0])
  const [text, setText] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [savedImages, setSavedImages] = useState<Array<{id: string, image: string, style: string, text: string, timestamp: number}>>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  // Security: Disable image selection
  const handleSelectStart = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault()
    return false
  }, [])

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
    if (selectedSign.requiresText && !text.trim()) {
      alert("Please enter some text for your fansign")
      return
    }

    if (selectedSign.maxImages > 0 && uploadedImages.filter(Boolean).length === 0) {
      alert("Please upload at least one image")
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
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
      } else {
        alert("Failed to generate image. Please try again.")
      }
    } catch (error) {
      console.error("Error generating image:", error)
      alert("An error occurred while generating the image. Please try again.")
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
    alert("Fansign saved to your collection!")
  }

  const handleDeleteSaved = (id: string) => {
    setSavedImages(prev => prev.filter(item => item.id !== id))
  }

  const handleReset = () => {
    setText("")
    setUploadedImages([])
    setGeneratedImage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="border-0 bg-black/80 backdrop-blur-sm shadow-[0_0_20px_rgba(138,43,226,0.6)]">
          <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-purple-300 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <CardTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
                Create Your Fansign
              </CardTitle>
              <div className="w-5"></div>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-gradient-to-b from-gray-900/60 to-black/60">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Style Selection */}
              <div className="lg:col-span-1">
                <h3 className="text-xl font-semibold text-purple-300 mb-6">Available Styles</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {signOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        selectedSign.id === option.id
                          ? "bg-purple-700/40 border-purple-400 shadow-lg shadow-purple-500/20"
                          : "bg-gray-800/50 border-purple-900/30 hover:bg-gray-800/70 hover:border-purple-700/50"
                      }`}
                      onClick={() => setSelectedSign(option)}
                    >
                      <div 
                        className="flex items-center justify-center w-full h-20 bg-gray-700/30 rounded-lg mb-3 overflow-hidden"
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        onSelectStart={handleSelectStart}
                      >
                        <img 
                          src={option.previewImage} 
                          alt={option.name}
                          className="w-full h-full object-cover rounded-lg select-none pointer-events-none"
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
                      </div>
                      <h4 className="font-semibold text-white text-center">{option.name}</h4>
                      {option.maxImages > 0 && (
                        <p className="text-xs text-purple-300 text-center mt-1">
                          Requires {option.maxImages} image{option.maxImages > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Customization Panel */}
              <div className="lg:col-span-1">
                <h3 className="text-xl font-semibold text-purple-300 mb-6">
                  Customize {selectedSign.name}
                </h3>

                <div className="space-y-6">
                  {selectedSign.requiresText && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-300">Enter your text:</label>
                      <Textarea
                        placeholder="Type your message here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="bg-gray-800/60 border-purple-700/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                        rows={4}
                      />
                      <p className="text-xs text-gray-400">
                        {selectedSign.id === "bophouse-new"
                          ? "Works best with exactly 2 words"
                          : "Keep it short for best results (1-3 words recommended)"}
                      </p>
                    </div>
                  )}

                  {selectedSign.maxImages > 0 && (
                    <div className="space-y-4">
                      {Array.from({ length: selectedSign.maxImages }, (_, index) => (
                        <div key={index} className="space-y-3">
                          <label className="text-sm font-medium text-gray-300">
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
                              className="flex items-center justify-center space-x-2 bg-purple-700/80 hover:bg-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors w-full"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Choose Image</span>
                            </label>
                            {uploadedImages[index] && (
                              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
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

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleGenerate}
                      disabled={
                        isGenerating ||
                        (selectedSign.requiresText && !text.trim()) ||
                        (selectedSign.maxImages > 0 && uploadedImages.filter(Boolean).length === 0)
                      }
                      className="flex-1 bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950 py-3"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>

                    <Button onClick={handleReset} variant="outline" className="border-purple-700/50 hover:bg-purple-900/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Result Panel */}
              <div className="lg:col-span-1">
                <h3 className="text-xl font-semibold text-purple-300 mb-6">Your Fansign</h3>

                {generatedImage ? (
                  <div className="space-y-4">
                    <div 
                      className="border border-purple-700/50 rounded-xl overflow-hidden bg-gray-800/30"
                      onContextMenu={handleContextMenu}
                      onDragStart={handleDragStart}
                      onSelectStart={handleSelectStart}
                    >
                      <img
                        src={generatedImage}
                        alt="Generated fansign"
                        className="w-full h-auto select-none pointer-events-none"
                        draggable={false}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleDownload}
                        className="flex-1 bg-green-700 hover:bg-green-600 py-3"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>

                      <Button
                        onClick={handleSave}
                        variant="outline"
                        className="border-purple-700/50 hover:bg-purple-900/20"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-purple-700/30 rounded-xl p-8 text-center">
                    <ImageIcon className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                    <p className="text-gray-400">Your generated fansign will appear here</p>
                  </div>
                )}

                {/* Saved Images */}
                {savedImages.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-purple-300 mb-4">Saved Fansigns</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {savedImages.map((saved) => (
                        <div key={saved.id} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                          <img
                            src={saved.image}
                            alt={saved.style}
                            className="w-12 h-12 object-cover rounded border border-purple-700/50 select-none pointer-events-none"
                            draggable={false}
                            onContextMenu={handleContextMenu}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{saved.style}</p>
                            <p className="text-xs text-gray-400 truncate">{saved.text}</p>
                          </div>
                          <Button
                            onClick={() => handleDeleteSaved(saved.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-700/50 text-red-400 hover:bg-red-900/20"
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
          </CardContent>
        </Card>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  )
}