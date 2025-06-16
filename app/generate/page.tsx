"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Upload, RefreshCw, ImageIcon } from "lucide-react"
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
    description: "Traditional illuminated sign style",
    processor: processSignImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1047.JPG-eUk9CLgdVSnDP6Q2CWWt0ahox0GZEn.jpeg"
  },
  {
    id: "bophouse",
    name: "Bophouse",
    description: "Bophouse style banner",
    processor: processBophouseImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1064.JPG-fIkmk9Jp6D6OZHlDhoxgpeUDAHzI3w.jpeg"
  },
  {
    id: "bophouse-new",
    name: "Bophouse New",
    description: "New Bophouse style with handwriting",
    processor: processBophouseNewImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1136.JPG-45Dhw5868FFua9u5UQT8VTJ81BKpfq.jpeg"
  },
  {
    id: "liv",
    name: "LIV Sign",
    description: "LED style sign",
    processor: processLivImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1076.JPG-VQMAwjnByZX1oMtvD1Dnwu0A6W90L4.jpeg"
  },
  {
    id: "liv-digital",
    name: "LIV Digital",
    description: "Digital display style",
    processor: processLivDigitalImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1112.JPG-ycFJnZXtoG4d3vQ9BVrXLhIF7NXxgr.jpeg"
  },
  {
    id: "poppy",
    name: "Poppy Sign",
    description: "Poppy style illuminated sign",
    processor: processPoppyImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "/images/poppy-template.jpeg"
  },
  {
    id: "booty",
    name: "Booty Sign",
    description: "Handwritten style on paper",
    processor: processBootyImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "/images/booty-template.jpeg"
  },
  {
    id: "double-monkey",
    name: "Double Monkey",
    description: "Cursive handwriting style",
    processor: processDoubleMonkeyImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-05%20at%2010.jpg-S12CeanADthNRBsbZztHcKmgSilm0S.jpeg"
  },
  {
    id: "three-cats",
    name: "Three Cats",
    description: "Card with handwritten text",
    processor: processThreeCatsImage,
    requiresText: true,
    maxImages: 0,
    previewImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-04-16_03-03-06.jpg-zTOcfTscZ9yF9I0lS86inZ59NpBRAN.jpeg"
  },
  {
    id: "times-square",
    name: "Times Square",
    description: "Billboard with your image",
    processor: processTimesSquareImage,
    requiresText: false,
    maxImages: 1,
    previewImage: "/images/times-square-billboard.jpeg"
  },
  {
    id: "times-square-new",
    name: "Times Square Dual",
    description: "Two billboards with your images",
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
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
    link.download = `fansign-${selectedSign.id}-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReset = () => {
    setText("")
    setUploadedImages([])
    setGeneratedImage(null)
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
                Create Your Fansign
              </CardTitle>
              <div className="w-5"></div>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-gradient-to-b from-gray-900/50 to-black/50">
            <Tabs defaultValue="select" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/40">
                <TabsTrigger value="select">Select Style</TabsTrigger>
                <TabsTrigger value="customize">Customize</TabsTrigger>
                <TabsTrigger value="generate">Generate</TabsTrigger>
              </TabsList>

              <TabsContent value="select" className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">Choose Your Sign Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {signOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedSign.id === option.id
                          ? "bg-purple-700/30 border-purple-500"
                          : "bg-gray-800/40 border-purple-900/50 hover:bg-gray-800/60 hover:border-purple-700/50"
                      }`}
                      onClick={() => setSelectedSign(option)}
                    >
                      <div className="flex items-center justify-center w-full h-16 bg-gray-700/50 rounded-md mb-2 overflow-hidden">
                        <img 
                          src={option.previewImage} 
                          alt={option.name}
                          className="w-full h-full object-cover rounded-md"
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
                      <h4 className="font-medium text-white mb-1">{option.name}</h4>
                      <p className="text-sm text-gray-400">{option.description}</p>
                      {option.maxImages > 0 && (
                        <p className="text-xs text-purple-300 mt-1">
                          Requires {option.maxImages} image{option.maxImages > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="customize" className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">
                  Customize Your {selectedSign.name}
                </h3>

                {selectedSign.requiresText && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Enter your text:</label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="bg-gray-800/50 border-purple-700/50 text-white placeholder-gray-400"
                      rows={3}
                    />
                    <p className="text-xs text-gray-400">
                      {selectedSign.id === "bophouse-new"
                        ? "Exactly 2 words work best for this style"
                        : "Keep it short for best results"}
                    </p>
                  </div>
                )}

                {selectedSign.maxImages > 0 && (
                  <div className="space-y-4">
                    {Array.from({ length: selectedSign.maxImages }, (_, index) => (
                      <div key={index} className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Upload Image {selectedSign.maxImages > 1 ? `${index + 1}` : ""}:
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, index)}
                            className="hidden"
                            id={`image-upload-${index}`}
                          />
                          <label
                            htmlFor={`image-upload-${index}`}
                            className="flex items-center space-x-2 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md cursor-pointer transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Choose Image</span>
                          </label>
                          {uploadedImages[index] && (
                            <div className="flex items-center space-x-2">
                              <img
                                src={uploadedImages[index]}
                                alt={`Upload ${index + 1}`}
                                className="w-12 h-12 object-cover rounded border border-purple-700/50"
                              />
                              <span className="text-sm text-green-400">✓ Image uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-gray-800/30 p-4 rounded-lg border border-purple-700/30">
                  <h4 className="font-medium text-purple-300 mb-2">Selected Style: {selectedSign.name}</h4>
                  <p className="text-sm text-gray-400">{selectedSign.description}</p>
                  <div className="mt-3 w-full h-24 bg-gray-700/50 rounded-md overflow-hidden">
                    <img 
                      src={selectedSign.previewImage} 
                      alt={selectedSign.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                        }
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="generate" className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">Generate Your Fansign</h3>

                <div className="space-y-4">
                  <div className="bg-gray-800/30 p-4 rounded-lg border border-purple-700/30">
                    <h4 className="font-medium text-white mb-2">Preview Settings:</h4>
                    <p className="text-sm text-gray-400">Style: {selectedSign.name}</p>
                    {selectedSign.requiresText && (
                      <p className="text-sm text-gray-400">Text: {text || "No text entered"}</p>
                    )}
                    {selectedSign.maxImages > 0 && (
                      <p className="text-sm text-gray-400">
                        Images: {uploadedImages.filter(Boolean).length} of {selectedSign.maxImages} uploaded
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={
                        isGenerating ||
                        (selectedSign.requiresText && !text.trim()) ||
                        (selectedSign.maxImages > 0 && uploadedImages.filter(Boolean).length === 0)
                      }
                      className="flex-1 bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Generate Fansign
                        </>
                      )}
                    </Button>

                    <Button onClick={handleReset} variant="outline" className="border-purple-700/50">
                      Reset
                    </Button>
                  </div>

                  {generatedImage && (
                    <div className="space-y-4">
                      <div className="border border-purple-700/50 rounded-lg overflow-hidden">
                        <img
                          src={generatedImage}
                          alt="Generated fansign"
                          className="w-full h-auto"
                        />
                      </div>

                      <Button
                        onClick={handleDownload}
                        className="w-full bg-green-700 hover:bg-green-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Your Fansign
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  )
}