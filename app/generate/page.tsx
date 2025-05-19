"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  ImageIcon,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Download,
  ExternalLink,
  Share2,
  Gift,
  Info,
  Key,
  ShoppingCart,
} from "lucide-react"
import { VT323 } from "next/font/google"
import { processSignImage } from "@/utils/processSignImage"
import { processBophouseImage } from "@/utils/processBophouseImage"
import { processLivImage } from "@/utils/processLivImage"
import { processLivDigitalImage } from "@/utils/processLivDigitalImage"
import { processPoppyImage } from "@/utils/processPoppyImage"
import { processBophouseNewImage } from "@/utils/processBophouseNewImage"
import { processDoubleMonkeyImage } from "@/utils/processDoubleMonkeyImage"
import { processThreeCatsImage } from "@/utils/processThreeCatsImage"
import { processBootyImage } from "@/utils/processBootyImage"
import { processTimesSquareImage } from "@/utils/processTimesSquareImage"
import { processBophousePhoneImage } from "@/utils/processBophousePhoneImage"
import { processTimesSquareNewImage } from "@/utils/processTimesSquareNewImage"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Load VT323 font for the LIV sign
const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

// Preview image URLs
const PREVIEW_IMAGES = {
  "bophouse-classic":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1064.JPG-fIkmk9Jp6D6OZHlDhoxgpeUDAHzI3w.jpeg",
  "bophouse-new":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1136.JPG-45Dhw5868FFua9u5UQT8VTJ81BKpfq.jpeg",
  "bophouse-phone":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1136.JPG-kfNyN8jQCd5Y3mQJPGkRS1tq7uZQSS.jpeg",
  liv: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1076.JPG-VQMAwjnByZX1oMtvD1Dnwu0A6W90L4.jpeg",
  livdigital:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1112.JPG-ycFJnZXtoG4d3vQ9BVrXLhIF7NXxgr.jpeg",
  poppy: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1047.JPG-eUk9CLgdVSnDP6Q2CWWt0ahox0GZEn.jpeg",
  doublemonkey:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-05%20at%2010.jpg-S12CeanADthNRBsbZztHcKmgSilm0S.jpeg",
  threecats:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-04-16_03-03-06.jpg-zTOcfTscZ9yF9I0lS86inZ59NpBRAN.jpeg",
  booty: "/images/booty-template.jpeg",
  "times-square": "/times-square-billboard-night.png",
  "times-square-2": "/times-square-billboard-night.png",
}

const FansignRequest = () => {
  const router = useRouter()

  // Core state
  const [mainFansignType, setMainFansignType] = useState("bophouse")
  const [clubSignType, setClubSignType] = useState("liv")
  const [requestText, setRequestText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [telegramWebApp, setTelegramWebApp] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [processedBophouseImage, setProcessedBophouseImage] = useState<string | null>(null)
  const [processedLivImage, setProcessedLivImage] = useState<string | null>(null)
  const [processedLivDigitalImage, setProcessedLivDigitalImage] = useState<string | null>(null)
  const [processedPoppyImage, setProcessedPoppyImage] = useState<string | null>(null)
  const [processedDoubleMonkeyImage, setProcessedDoubleMonkeyImage] = useState<string | null>(null)
  const [processedThreeCatsImage, setProcessedThreeCatsImage] = useState<string | null>(null)
  const [processedBootyImage, setProcessedBootyImage] = useState<string | null>(null)
  const [processedTimesSquareImage, setProcessedTimesSquareImage] = useState<string | null>(null)
  const [processedTimesSquareNewImage, setProcessedTimesSquareNewImage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [canvasRef, setCanvasRef] = useState<React.RefObject<HTMLCanvasElement> | null>(useRef<HTMLCanvasElement>(null))
  const [showDownloadInstructions, setShowDownloadInstructions] = useState(false)
  const [downloadLink, setDownloadLink] = useState<string | null>(null)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [canvasInitialized, setCanvasInitialized] = useState(false)
  const [isCanvasLoading, setIsCanvasLoading] = useState(true)
  const [canvasInitAttempts, setCanvasInitAttempts] = useState(0)
  const [componentMounted, setComponentMounted] = useState(false)
  const [showCreditInfo, setShowCreditInfo] = useState(false)
  const [showKeyPurchaseModal, setShowKeyPurchaseModal] = useState(false)

  // Channel join verification
  const [userVerified, setUserVerified] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)

  // Add a new state for the bophouse type - changed default to "new" (handwritten)
  const [bophouseType, setBophouseType] = useState("classic")
  const [animalSignType, setAnimalSignType] = useState("doublemonkey")
  const [girlsSignType, setGirlsSignType] = useState("booty") // Currently not used - feature closed
  const [billboardType, setBillboardType] = useState("times-square")
  const [activeTab, setActiveTab] = useState("club")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedSecondImage, setUploadedSecondImage] = useState<string | null>(null)
  const [userCredits, setUserCredits] = useState(0)
  const [isLoadingCredits, setIsLoadingCredits] = useState(false)

  // Add a ref to track the last credit update operation
  const lastCreditOperationRef = useRef<{
    timestamp: number
    type: string
    amount: number
  } | null>(null)

  // Computed fansign type based on main type and sub-type
  const fansignType =
    activeTab === "club"
      ? clubSignType
      : activeTab === "bophouse"
        ? `bophouse-${bophouseType}`
        : activeTab === "animal"
          ? animalSignType
          : activeTab === "billboard"
            ? billboardType
            : activeTab

  // Character limit
  const MAX_CHARS = 20
  const MAX_LIV_CHARS = 13

  // Mark component as mounted
  useEffect(() => {
    setComponentMounted(true)
    return () => setComponentMounted(false)
  }, [])

  // Get user ID and auth token from session storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = sessionStorage.getItem("telegram_user_id")
      const storedToken = sessionStorage.getItem("telegram_auth_token")

      if (storedUserId) {
        setUserId(storedUserId)
        setUserVerified(true)
      }

      if (storedToken) {
        setAuthToken(storedToken)
      }
    }
  }, [])

  // Fetch user credits when userId is available
  useEffect(() => {
    if (userId) {
      fetchUserCredits()
    }
  }, [userId])

  // Fetch user credits
  const fetchUserCredits = async () => {
    if (!userId) return

    setIsLoadingCredits(true)
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Add auth token if available
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      const response = await fetch(`/api/user-credits?userId=${encodeURIComponent(userId)}`, {
        headers,
        // Add a cache-busting parameter
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch credits: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setUserCredits(data.credits)
      } else {
        console.error("Error fetching credits:", data.error)
      }
    } catch (error) {
      console.error("Error fetching user credits:", error)
    } finally {
      setIsLoadingCredits(false)
    }
  }

  // Create a canvas element programmatically
  useEffect(() => {
    if (!componentMounted) return

    // Create a canvas element if it doesn't exist
    if (!canvasRef.current) {
      try {
        // Create a new canvas element
        const newCanvas = document.createElement("canvas")
        newCanvas.width = 1000
        newCanvas.height = 800
        newCanvas.style.position = "absolute"
        newCanvas.style.left = "-9999px"
        newCanvas.setAttribute("aria-hidden", "true")

        // Set the ref
        setCanvasRef((prev) => {
          const ref = { ...prev, current: newCanvas } as any
          return ref
        })

        // Append to body to ensure it's in the DOM
        document.body.appendChild(newCanvas)

        console.log("Canvas element created programmatically")

        // Clean up on unmount
        return () => {
          if (newCanvas.parentNode) {
            newCanvas.parentNode.removeChild(newCanvas)
          }
          setCanvasRef(null)
        }
      } catch (error) {
        console.error("Error creating canvas element:", error)
        setErrorMessage("Failed to create canvas element. Please refresh the page.")
      }
    }
  }, [componentMounted])

  // Initialize canvas after it's created
  useEffect(() => {
    if (!componentMounted || !canvasRef.current) return

    const initializeCanvas = () => {
      try {
        const canvas = canvasRef.current
        if (!canvas) {
          console.error("Canvas reference is not available during initialization")
          return false
        }

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          console.error("Failed to get canvas context")
          return false
        }

        // Set canvas dimensions
        canvas.width = 1000
        canvas.height = 800

        // Clear the canvas with a black background
        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw some text to ensure the canvas is working
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "20px Arial"
        ctx.fillText("Canvas initialized", 20, 30)

        console.log("Canvas initialized successfully with dimensions:", canvas.width, "x", canvas.height)
        setCanvasInitialized(true)
        setIsCanvasLoading(false)
        return true
      } catch (error) {
        console.error("Error initializing canvas:", error)
        setCanvasInitAttempts((prev) => prev + 1)
        return false
      }
    }

    // Try to initialize the canvas with a delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const success = initializeCanvas()

      // If initialization failed and we haven't tried too many times, retry
      if (!success && canvasInitAttempts < 5) {
        setCanvasInitAttempts((prev) => prev + 1)
      } else if (canvasInitAttempts >= 5) {
        console.error("Failed to initialize canvas after multiple attempts")
        setIsCanvasLoading(false)
        setErrorMessage("Failed to initialize canvas. Please refresh the page and try again.")
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [componentMounted, canvasInitAttempts, canvasRef])

  // Initialize Telegram Web App
  useEffect(() => {
    if (!componentMounted) return

    try {
      // @ts-ignore
      if (window.Telegram && window.Telegram.WebApp) {
        // @ts-ignore
        const twa = window.Telegram.WebApp
        setTelegramWebApp(twa)

        // Get user ID from Telegram WebApp
        if (twa.initDataUnsafe && twa.initDataUnsafe.user) {
          const telegramUserId = twa.initDataUnsafe.user.id.toString()
          setUserId(telegramUserId)
          setUserVerified(true)
        }

        twa.ready()
        twa.expand()
      }
    } catch (error) {
      console.error("Error initializing Telegram Web App:", error)
    }
  }, [componentMounted])

  // Create a simplified function to handle image generation
  const prepareImageGeneration = useCallback(async () => {
    if (!userId) {
      return { success: false, error: "User ID not found" }
    }

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      return { success: true }
    } catch (error) {
      console.error("Error preparing image generation:", error)
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      }
    }
  }, [userId])

  async function handleSubmit(e: React.FormEvent) {
    e?.preventDefault()

    if (isSubmitting) return

    // Reset states
    setIsSubmitting(true)
    setErrorMessage(null)

    // Check if user has enough credits
    if (userCredits < 1) {
      setErrorMessage("You don't have enough credits. Please redeem a key to get more credits.")
      setShowKeyPurchaseModal(true)
      setIsSubmitting(false)
      return
    }

    // Prepare for image generation
    const prepResult = await prepareImageGeneration()

    if (!prepResult.success) {
      setErrorMessage(`Error: ${prepResult.error}`)
      setIsSubmitting(false)
      return
    }

    // Deduct one credit
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Add auth token if available
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      const response = await fetch("/api/use-credit", {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId,
          // Add a request ID to prevent duplicate requests
          requestId: Date.now().toString(36) + Math.random().toString(36).substring(2),
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setErrorMessage(`Error: ${data.error || "Failed to deduct credit"}`)
        setIsSubmitting(false)
        return
      }

      // Update local credit count
      setUserCredits(data.credits)

      // Record the credit operation
      lastCreditOperationRef.current = {
        timestamp: Date.now(),
        type: "deduct",
        amount: 1,
      }
    } catch (error) {
      console.error("Error deducting credit:", error)
      setErrorMessage("Failed to deduct credit. Please try again.")
      setIsSubmitting(false)
      return
    }

    // Now process the image
    let dataUrl = null

    try {
      if (fansignType === "bophouse-classic") {
        dataUrl = await processBophouseImage(requestText, canvasRef)
        setProcessedBophouseImage(dataUrl)
      } else if (fansignType === "bophouse-new") {
        dataUrl = await processBophouseNewImage(requestText, canvasRef)
        setProcessedBophouseImage(dataUrl)
      } else if (fansignType === "bophouse-phone") {
        dataUrl = await processBophousePhoneImage(requestText, canvasRef)
        setProcessedBophouseImage(dataUrl)
      } else if (fansignType === "liv") {
        dataUrl = await processLivImage(requestText, canvasRef, vt323.style.fontFamily)
        setProcessedLivImage(dataUrl)
      } else if (fansignType === "livdigital") {
        dataUrl = await processLivDigitalImage(requestText, canvasRef)
        setProcessedLivDigitalImage(dataUrl)
      } else if (fansignType === "poppy") {
        dataUrl = await processPoppyImage(requestText, canvasRef)
        setProcessedPoppyImage(dataUrl)
      } else if (fansignType === "doublemonkey") {
        dataUrl = await processDoubleMonkeyImage(requestText, canvasRef)
        setProcessedDoubleMonkeyImage(dataUrl)
      } else if (fansignType === "threecats") {
        dataUrl = await processThreeCatsImage(requestText, canvasRef)
        setProcessedThreeCatsImage(dataUrl)
      } else if (fansignType === "booty") {
        dataUrl = await processBootyImage(requestText, canvasRef)
        setProcessedBootyImage(dataUrl)
      } else if (fansignType === "times-square") {
        dataUrl = await processTimesSquareImage(uploadedImage, canvasRef)
        setProcessedTimesSquareImage(dataUrl)
      } else if (fansignType === "times-square-2") {
        dataUrl = await processTimesSquareNewImage(uploadedImage, uploadedSecondImage, canvasRef)
        setProcessedTimesSquareNewImage(dataUrl)
      } else {
        dataUrl = await processSignImage(requestText, canvasRef)
        setProcessedImage(dataUrl)
      }

      console.log("Image processing completed successfully")

      // Store the image in localStorage for direct download
      if (typeof window !== "undefined" && dataUrl) {
        try {
          localStorage.setItem("fansign_image", dataUrl)
          console.log("Image stored in localStorage for direct download")
        } catch (e) {
          console.error("Failed to store image in localStorage:", e)
        }
      }

      // Log the successful generation
      try {
        await fetch("/api/log/image-generation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            fansignType,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (error) {
        // Non-critical error, just log it
        console.error("Failed to log image generation:", error)
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      setErrorMessage(`An unexpected error occurred: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to generate a shareable download link
  async function generateDownloadLink() {
    if (!userVerified) {
      setErrorMessage(`Please wait for initialization to complete`)
      return
    }

    const imageData = getCurrentProcessedImage()
    if (!imageData) {
      setErrorMessage("No image data available. Please generate an image first.")
      return
    }

    setIsGeneratingLink(true)
    setErrorMessage(null)

    try {
      // Store the image in localStorage for direct download
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("fansign_image", imageData)
          console.log("Image stored in localStorage for direct download")
        } catch (e) {
          console.error("Failed to store image in localStorage:", e)
        }
      }

      // Create a FormData object to send the image data directly
      const formData = new FormData()
      formData.append("imageData", imageData)
      formData.append("userId", userId || "unknown")

      // Add auth token if available
      const headers: HeadersInit = {}
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      // Upload the image to get a temporary URL
      const response = await fetch("/api/temp-image", {
        method: "POST",
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Server error response:", errorData)
        throw new Error(errorData.error || `Server responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success || !data.imageId) {
        console.error("Invalid server response:", data)
        throw new Error(data.error || "Failed to create download link")
      }

      // Get the full URL for the download page
      const baseUrl = window.location.origin
      const downloadUrl = `${baseUrl}/download-image/${data.imageId}`

      // Set the download link
      setDownloadLink(downloadUrl)
      console.log("Download link created:", downloadUrl)

      // Show success message
      toast({
        title: "Link Created",
        description: "Download link has been created successfully!",
        variant: "default",
      })

      if (telegramWebApp) {
        telegramWebApp.showAlert(
          "Download link created! Click the 'Open in Browser' button to download your image in your device's browser.",
        )
      }
    } catch (error) {
      console.error("Error creating download link:", error)
      setErrorMessage(`Failed to create download link: ${error.message || "Unknown error"}`)
    } finally {
      setIsGeneratingLink(false)
    }
  }

  // Function to open the download link in external browser
  function openDownloadLink() {
    if (!downloadLink) {
      setErrorMessage("No download link available. Please generate a link first.")
      return
    }

    // If in Telegram WebApp, use the openLink method to open in external browser
    if (telegramWebApp) {
      telegramWebApp.openLink(downloadLink)
    } else {
      // For regular browsers, open in a new tab
      window.open(downloadLink, "_blank")
    }
  }

  // Function to copy the download link to clipboard
  async function copyDownloadLink() {
    if (!downloadLink) {
      setErrorMessage("No download link available. Please generate a link first.")
      return
    }

    try {
      await navigator.clipboard.writeText(downloadLink)

      // Show success message
      toast({
        title: "Link Copied",
        description: "Download link has been copied to clipboard!",
        variant: "default",
      })

      if (telegramWebApp) {
        telegramWebApp.showAlert("Download link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error copying link:", error)
      setErrorMessage("Failed to copy link to clipboard. Please try again.")
    }
  }

  const getCurrentProcessedImage = () => {
    if (fansignType.startsWith("bophouse-")) {
      return processedBophouseImage
    } else if (fansignType === "liv") {
      return processedLivImage
    } else if (fansignType === "livdigital") {
      return processedLivDigitalImage
    } else if (fansignType === "poppy") {
      return processedPoppyImage
    } else if (fansignType === "doublemonkey") {
      return processedDoubleMonkeyImage
    } else if (fansignType === "threecats") {
      return processedThreeCatsImage
    } else if (fansignType === "booty") {
      return processedBootyImage
    } else if (fansignType === "times-square") {
      return processedTimesSquareImage
    } else if (fansignType === "times-square-2") {
      return processedTimesSquareNewImage
    } else {
      return processedImage
    }
  }

  // Add a function to handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isSecondImage = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset processed image when a new image is uploaded
    setProcessedTimesSquareImage(null)
    setProcessedTimesSquareNewImage(null)

    // Clear error message when a new image is uploaded
    if (errorMessage) {
      setErrorMessage(null)
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (isSecondImage) {
        setUploadedSecondImage(event.target?.result as string)
      } else {
        setUploadedImage(event.target?.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle text input with character limit
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    let maxLength = MAX_CHARS

    // Different character limits for different sign types
    if (fansignType.startsWith("bophouse") || fansignType === "liv") {
      maxLength = MAX_LIV_CHARS
    }

    // For Liv Digital, enforce exactly 3 words max
    if (fansignType === "livdigital") {
      const words = text.split(" ").filter((word) => word.trim() !== "")
      if (words.length > 3) {
        // Only keep the first 3 words
        const truncatedText = words.slice(0, 3).join(" ")
        setRequestText(truncatedText)
        return
      }
    }

    if (text.length <= maxLength) {
      setRequestText(text)
      // Reset processed images when text changes
      if (processedImage) {
        setProcessedImage(null)
      }
      if (processedBophouseImage) {
        setProcessedBophouseImage(null)
      }
      if (processedLivImage) {
        setProcessedLivImage(null)
      }
      if (processedLivDigitalImage) {
        setProcessedLivDigitalImage(null)
      }
      if (processedPoppyImage) {
        setProcessedPoppyImage(null)
      }
      if (processedDoubleMonkeyImage) {
        setProcessedDoubleMonkeyImage(null)
      }
      if (processedThreeCatsImage) {
        setProcessedThreeCatsImage(null)
      }
      if (processedBootyImage) {
        setProcessedBootyImage(null)
      }

      // Clear error message when text changes
      if (errorMessage) {
        setErrorMessage(null)
      }

      // Hide download instructions when text changes
      if (showDownloadInstructions) {
        setShowDownloadInstructions(false)
      }

      // Reset download link when text changes
      if (downloadLink) {
        setDownloadLink(null)
      }
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value)
    setActiveTab(value)
    // Reset processed images when type changes
    setProcessedImage(null)
    setProcessedBophouseImage(null)
    setProcessedLivImage(null)
    setProcessedLivDigitalImage(null)
    setProcessedPoppyImage(null)
    setProcessedDoubleMonkeyImage(null)
    setProcessedThreeCatsImage(null)
    setProcessedBootyImage(null)
    setProcessedTimesSquareImage(null)
    setProcessedTimesSquareNewImage(null)
    // Clear error message when tab changes
    setErrorMessage(null)
    // Hide download instructions when tab changes
    setShowDownloadInstructions(false)
    // Reset download link when tab changes
    setDownloadLink(null)
  }

  // Handle bophouse type change
  const handleBophouseTypeChange = (value: string) => {
    setBophouseType(value)
    // Reset processed images when type changes
    setProcessedBophouseImage(null)
    // Clear error message when type changes
    setErrorMessage(null)
    // Hide download instructions when type changes
    setShowDownloadInstructions(false)
    // Reset download link when type changes
    setDownloadLink(null)
  }

  // Handle club sign type change
  const handleClubSignTypeChange = (value: string) => {
    setClubSignType(value)
    // Reset processed images when type changes
    setProcessedLivImage(null)
    setProcessedLivDigitalImage(null)
    setProcessedPoppyImage(null)
    // Clear error message when type changes
    setErrorMessage(null)
    // Hide download instructions when type changes
    setShowDownloadInstructions(false)
    // Reset download link when type changes
    setDownloadLink(null)
  }

  // Handle girls sign type change - Currently not used as feature is closed
  const handleGirlsSignTypeChange = (value: string) => {
    setGirlsSignType(value)
    // Reset processed images when type changes
    setProcessedBootyImage(null)
    // Clear error message when type changes
    setErrorMessage(null)
    // Hide download instructions when type changes
    setShowDownloadInstructions(false)
    // Reset download link when type changes
    setDownloadLink(null)
  }

  // Handle billboard type change
  const handleBillboardTypeChange = (value: string) => {
    setBillboardType(value)
    // Reset processed images when type changes
    setProcessedTimesSquareImage(null)
    setProcessedTimesSquareNewImage(null)
    // Reset uploaded images when billboard type changes
    setUploadedImage(null)
    setUploadedSecondImage(null)
    // Clear error message when type changes
    setErrorMessage(null)
    // Hide download instructions when type changes
    setShowDownloadInstructions(false)
    // Reset download link when type changes
    setDownloadLink(null)
  }

  const generatedImage = getCurrentProcessedImage()

  const reinitializeCanvas = () => {
    setIsCanvasLoading(true)
    setCanvasInitialized(false)
    setCanvasInitAttempts(0)
  }

  // Function to handle key purchase
  const handleKeyPurchase = () => {
    // If in Telegram WebApp, use the openLink method to open in external browser
    if (telegramWebApp) {
      telegramWebApp.openLink("https://fansign.mysellauth.com/product/fansign-credit-top-up")
    } else {
      // For regular browsers, open in a new tab
      window.open("https://fansign.mysellauth.com/product/fansign-credit-top-up", "_blank")
    }
    // Close the modal after opening the link
    setShowKeyPurchaseModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      {/* Key Purchase Modal */}
      {showKeyPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-green-700/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-400">Need More Credits?</h3>
              <button onClick={() => setShowKeyPurchaseModal(false)} className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-300">You need credits to generate images. Purchase keys to get more credits!</p>

              <div className="bg-black/40 p-4 rounded-lg border border-green-700/30">
                <h4 className="font-semibold text-green-400 mb-2">Available Key Types:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Basic Key:</span>
                    <span className="font-bold">10 credits</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Standard Key:</span>
                    <span className="font-bold">50 credits</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Premium Key:</span>
                    <span className="font-bold">100 credits</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Unlimited Key:</span>
                    <span className="font-bold">9999 credits</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-gray-400">
                Each image generation costs 1 credit. Keys can be redeemed in the "Redeem Key" section.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleKeyPurchase}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white py-5"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span className="font-medium">Buy Keys</span>
              </Button>

              <Button
                onClick={() => router.push("/redeem")}
                variant="outline"
                className="flex-1 border-green-700/50 text-green-400 hover:bg-green-900/20"
              >
                <Key className="w-5 h-5 mr-2" />
                <span>Redeem Key</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="w-full max-w-md border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-purple-300 hover:text-white hover:bg-purple-800/30"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="sr-only">Back</span>
            </Button>
            <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              Custom Fansign
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-purple-300 hover:text-white hover:bg-purple-800/30"
              onClick={() => setShowCreditInfo(!showCreditInfo)}
            >
              <Info className="w-5 h-5" />
              <span className="sr-only">Credits Info</span>
            </Button>
          </div>
        </CardHeader>

        {!userVerified ? (
          <CardContent className="pt-6 pb-4 bg-gradient-to-b from-gray-900/50 to-black/50">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <RefreshCw className="w-16 h-16 text-purple-400 mb-2 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-white">Initializing...</h3>
              <p className="text-gray-300 mb-4">Please wait while we set up your fansign request.</p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="pt-4 pb-4 bg-gradient-to-b from-gray-900/50 to-black/50">
            {/* Credit Info Modal */}
            {showCreditInfo && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                onClick={() => setShowCreditInfo(false)}
              >
                <div
                  className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-purple-700/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-white mb-4">Credits System</h3>
                  <div className="space-y-3 text-gray-300">
                    <p>
                      • New users start with <span className="text-purple-400 font-bold">0 credits</span>
                    </p>
                    <p>
                      • Each image generation costs <span className="text-purple-400 font-bold">1 credit</span>
                    </p>
                    <p>• Get more credits by redeeming keys</p>
                    <p>• Credits are non-refundable and tied to your Telegram account</p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setShowCreditInfo(false)}>Close</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Simple header */}
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold text-purple-300">Create Your Custom Fansign</h2>
              <p className="text-sm text-purple-200/70">Choose a style and enter your text to generate an image</p>
            </div>

            <div className="space-y-6">
              {/* Canvas loading indicator */}
              {isCanvasLoading && (
                <div className="text-center p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                    <p className="text-purple-300">Initializing canvas...</p>
                  </div>
                </div>
              )}

              {/* Current Credits Display */}
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Gift className="w-5 h-5 text-purple-400 mr-2" />
                  <span className="text-sm font-medium">Your Credits:</span>
                </div>
                <div className="flex items-center">
                  {isLoadingCredits ? (
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  ) : (
                    <>
                      <span className="text-lg font-bold">{userCredits}</span>
                      {userCredits < 1 && <span className="ml-2 text-xs text-red-400">(Need 1 credit)</span>}
                    </>
                  )}
                </div>
              </div>

              {/* Buy Keys Button - Enhanced for better visibility */}
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-4 rounded-lg border border-green-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 text-green-400 mr-2" />
                    <span className="text-sm font-medium text-green-300">Need more credits?</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white"
                    onClick={() => setShowKeyPurchaseModal(true)}
                  >
                    Buy Keys
                  </Button>
                </div>
              </div>

              {/* Tabbed interface for sign categories */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4 bg-gray-800/40">
                  <TabsTrigger
                    value="bophouse"
                    className="data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  >
                    Bophouse
                  </TabsTrigger>
                  <TabsTrigger
                    value="club"
                    className="data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  >
                    Club
                  </TabsTrigger>
                  <TabsTrigger
                    value="animal"
                    className="data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  >
                    Animal
                  </TabsTrigger>
                  <TabsTrigger
                    value="billboard"
                    className="data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  >
                    Billboard
                  </TabsTrigger>
                </TabsList>
                {/* Bophouse Signs Content */}
                <TabsContent value="bophouse" className="mt-0 space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-purple-300 flex items-center">
                      <span className="inline-block w-1 h-4 bg-purple-500 mr-2 rounded-full"></span>
                      Select Bophouse Style:
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                          bophouseType === "classic"
                            ? "bg-purple-700/30 border-purple-500"
                            : "bg-gray-800/40 border-purple-900/50 hover:bg-gray-800/60 hover:border-purple-700/50"
                        }`}
                        onClick={() => handleBophouseTypeChange("classic")}
                      >
                        <div className="w-full h-24 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={PREVIEW_IMAGES["bophouse-classic"] || "/placeholder.svg"}
                            alt="Classic Bophouse"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <span className="text-sm font-medium">Classic Style</span>
                      </div>
                      <div
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                          bophouseType === "phone"
                            ? "bg-purple-700/30 border-purple-500"
                            : "bg-gray-800/40 border-purple-900/50 hover:bg-gray-800/60 hover:border-purple-700/50"
                        }`}
                        onClick={() => handleBophouseTypeChange("phone")}
                      >
                        <div className="w-full h-24 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={PREVIEW_IMAGES["bophouse-phone"] || "/placeholder.svg"}
                            alt="Phone Style"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <span className="text-sm font-medium">Phone Style</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                {/* Club Signs Content */}
                <TabsContent value="club" className="mt-0 space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-purple-300 flex items-center">
                      <span className="inline-block w-1 h-4 bg-purple-500 mr-2 rounded-full"></span>
                      Select Club Sign:
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div
                        className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                          clubSignType === "liv"
                            ? "bg-purple-700/30 border-purple-500"
                            : "bg-gray-800/40 border-purple-900/50 hover:bg-gray-800/60 hover:border-purple-700/50"
                        }`}
                        onClick={() => handleClubSignTypeChange("liv")}
                      >
                        <div className="w-full h-20 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={PREVIEW_IMAGES["liv"] || "/placeholder.svg"}
                            alt="Liv Digital"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <span className="text-xs font-medium">Liv Digital</span>
                      </div>
                      <div
                        className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                          clubSignType === "livdigital"
                            ? "bg-purple-700/30 border-purple-500"
                            : "bg-gray-800/40 border-purple-900/50 hover:bg-gray-800/60 hover:border-purple-700/50"
                        }`}
                        onClick={() => handleClubSignTypeChange("livdigital")}
                      >
                        <div className="w-full h-20 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={PREVIEW_IMAGES["livdigital"] || "/placeholder.svg"}
                            alt="liv (new)"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <span className="text-xs font-medium">liv (new)</span>
                      </div>
                      <div
                        className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                          clubSignType === "poppy"
                            ? "bg-purple-700/30 border-purple-500"
                            : "bg-gray-800/40 border-purple-900/50 hover:bg-gray-800/60 hover:border-purple-700/50"
                        }`}
                        onClick={() => handleClubSignTypeChange("poppy")}
                      >
                        <div className="w-full h-20 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={PREVIEW_IMAGES["poppy"] || "/placeholder.svg"}
                            alt="Poppy"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <span className="text-xs font-medium">Poppy</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                {/* Animal Signs Content */}
                <TabsContent value="animal" className="mt-0 space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-purple-300 flex items-center">
                      <span className="inline-block w-1 h-4 bg-purple-500 mr-2 rounded-full"></span>
                      Select Animal Sign:
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                          animalSignType === "doublemonkey"
                            ? "bg-purple-700/30 border-purple-500"
                            : "bg-gray-800/40 border-purple-900/50 hover:bg-gray-800/60 hover:border-purple-700/50"
                        }`}
                        onClick={() => setAnimalSignType("doublemonkey")}
                      >
                        <div className="w-full h-24 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={PREVIEW_IMAGES["doublemonkey"] || "/placeholder.svg"}
                            alt="Double Monkey"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <span className="text-sm font-medium">Double Monkey</span>
                      </div>
                      <div
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                          animalSignType === "threecats"
                            ? "bg-purple-700/30 border-purple-500"
                            : "bg-gray-800/40 border-purple-900/50 hover:bg-gray-800/60 hover:border-purple-700/50"
                        }`}
                        onClick={() => setAnimalSignType("threecats")}
                      >
                        <div className="w-full h-24 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={PREVIEW_IMAGES["threecats"] || "/placeholder.svg"}
                            alt="Three Cats"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <span className="text-sm font-medium">Three Cats</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="billboard" className="mt-0 space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-purple-300 flex items-center">
                      <span className="inline-block w-1 h-4 bg-purple-500 mr-2 rounded-full"></span>
                      Select Billboard:
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                          billboardType === "times-square"
                            ? "bg-purple-700/30 border-purple-500"
                            : "bg-gray-800/40 border-purple-900/50 hover:bg-gray-800/60 hover:border-purple-700/50"
                        }`}
                        onClick={() => handleBillboardTypeChange("times-square")}
                      >
                        <div className="w-full h-24 rounded-md mb-2 flex items-center justify-center overflow-hidden bg-gray-800">
                          <img
                            src={PREVIEW_IMAGES["times-square"] || "/placeholder.svg"}
                            alt="Times Square Billboard"
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = "/generic-billboard.png"
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">Times Square</span>
                      </div>
                      <div
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                          billboardType === "times-square-2"
                            ? "bg-purple-700/30 border-purple-500"
                            : "bg-gray-800/40 border-purple-900/50 hover:bg-gray-800/60 hover:border-purple-700/50"
                        }`}
                        onClick={() => handleBillboardTypeChange("times-square-2")}
                      >
                        <div className="w-full h-24 rounded-md mb-2 flex items-center justify-center overflow-hidden bg-gray-800">
                          <img
                            src={PREVIEW_IMAGES["times-square-2"] || "/placeholder.svg"}
                            alt="Times Square Billboard New"
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = "/generic-billboard.png"
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">Times Square 2</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {activeTab !== "billboard" ? (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-medium text-purple-300 flex items-center">
                      <span className="inline-block w-1 h-4 bg-purple-500 mr-2 rounded-full"></span>
                      Your Request:
                    </h3>
                    <Textarea
                      placeholder={
                        fansignType === "bophouse-new" || fansignType === "bophouse-classic"
                          ? "Enter exactly 2 words for this style"
                          : fansignType === "liv"
                            ? "Enter text for fansign (13 chars max)"
                            : "Enter text for fansign"
                      }
                      value={requestText}
                      onChange={handleTextChange}
                      className="min-h-[80px] bg-gray-800/40 border-purple-900/50 focus:border-purple-500 focus:ring-purple-500 placeholder:text-gray-500 text-gray-100 resize-none"
                    />

                    {fansignType === "bophouse-new" && (
                      <div className="text-xs text-purple-300/70 italic">
                        <p>Please enter exactly 2 words for the handwritten style.</p>
                        <p className="mt-1">
                          Words: {requestText.split(/\s+/).filter((word) => word.length > 0).length}/2
                        </p>
                      </div>
                    )}

                    {fansignType === "bophouse-classic" && (
                      <div className="text-xs text-purple-300/70 italic">
                        <p>Please enter exactly 2 words for the classic style.</p>
                        <p className="mt-1">
                          Words: {requestText.split(/\s+/).filter((word) => word.length > 0).length}/2
                        </p>
                      </div>
                    )}

                    {fansignType === "bophouse-phone" && (
                      <div className="text-xs text-purple-300/70 italic">
                        <p>The first word cannot be longer than 7 characters for Phone style.</p>
                        {requestText.trim() && (
                          <p className="mt-1">First word length: {requestText.trim().split(/\s+/)[0]?.length || 0}/7</p>
                        )}
                      </div>
                    )}

                    {fansignType === "livdigital" && (
                      <div className="text-xs text-purple-300/70 italic">
                        <p>Use exactly 3 words for best results (max {MAX_LIV_CHARS} characters).</p>
                        <p className="mt-1">
                          Words: {requestText.split(" ").filter((word) => word.trim() !== "").length}/3 | Characters:{" "}
                          {requestText.length}/{MAX_LIV_CHARS}
                        </p>
                      </div>
                    )}

                    {fansignType === "doublemonkey" && (
                      <div className="text-xs text-purple-300/70 italic">
                        <p>Please enter only ONE word for Double Monkey sign.</p>
                        <p className="mt-1">
                          Words: {requestText.split(/\s+/).filter((word) => word.length > 0).length}/1
                        </p>
                      </div>
                    )}

                    {/* Credit cost note */}
                    <div className="text-xs text-purple-300/70 italic text-center">
                      <p>Generating an image costs 1 credit</p>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !requestText.trim() || isCanvasLoading || userCredits < 1}
                      className="w-full bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-600 hover:to-violet-800 text-white font-medium py-5 mt-4"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          <span>Generating...</span>
                        </div>
                      ) : userCredits < 1 ? (
                        <div className="flex items-center justify-center">
                          <Gift className="w-5 h-5 mr-2" />
                          <span>Need Credits</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 mr-2" />
                          <span>Generate Image</span>
                        </div>
                      )}
                    </Button>

                    {/* Redeem button when no credits */}
                    {userCredits < 1 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          onClick={() => router.push("/redeem")}
                          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-medium py-5"
                        >
                          <Key className="w-5 h-5 mr-2" />
                          <span>Redeem Key</span>
                        </Button>

                        <Button
                          onClick={() => setShowKeyPurchaseModal(true)}
                          className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-medium py-5"
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          <span>Buy Keys</span>
                        </Button>
                      </div>
                    )}

                    {/* Errors */}
                    {errorMessage && (
                      <div className="flex items-start space-x-2 text-sm text-red-400 mt-2 p-2 bg-red-900/20 rounded-md border border-red-900/30">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{errorMessage}</p>
                        {errorMessage.includes("Canvas") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs border-red-500 text-red-400 hover:bg-red-900/20"
                            onClick={reinitializeCanvas}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry Canvas
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {billboardType === "times-square-2" ? (
                      <>
                        <h3 className="text-sm font-medium text-purple-300 flex items-center">
                          <span className="inline-block w-1 h-4 bg-purple-500 mr-2 rounded-full"></span>
                          Upload First Image (Top Billboard):
                        </h3>
                        <div className="bg-gray-800/40 border border-purple-900/50 rounded-md p-4">
                          <div className="flex flex-col items-center justify-center gap-3">
                            {uploadedImage ? (
                              <div className="relative w-full">
                                <img
                                  src={uploadedImage || "/placeholder.svg"}
                                  alt="Uploaded first image"
                                  className="w-full h-auto max-h-48 object-contain rounded-md"
                                />
                                <Button
                                  onClick={() => setUploadedImage(null)}
                                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e)}
                                  id="upload-first-image"
                                  className="hidden"
                                />
                                <label
                                  htmlFor="upload-first-image"
                                  className="inline-flex items-center px-4 py-2 border border-purple-500 rounded-md text-purple-300 hover:bg-purple-800/30 cursor-pointer transition-colors"
                                >
                                  <ImageIcon className="w-5 h-5 mr-2" />
                                  Upload First Image
                                </label>
                              </>
                            )}
                            <div className="text-xs text-purple-300/70 italic">
                              <p>Image will be placed at position: 73px from top, 358px from left</p>
                              <p>Size: 286 × 84 pixels (top billboard)</p>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-sm font-medium text-purple-300 flex items-center">
                          <span className="inline-block w-1 h-4 bg-purple-500 mr-2 rounded-full"></span>
                          Upload Second Image (Bottom Billboard):
                        </h3>
                        <div className="bg-gray-800/40 border border-purple-900/50 rounded-md p-4">
                          <div className="flex flex-col items-center justify-center gap-3">
                            {uploadedSecondImage ? (
                              <div className="relative w-full">
                                <img
                                  src={uploadedSecondImage || "/placeholder.svg"}
                                  alt="Uploaded second image"
                                  className="w-full h-auto max-h-48 object-contain rounded-md"
                                />
                                <Button
                                  onClick={() => setUploadedSecondImage(null)}
                                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, true)}
                                  id="upload-second-image"
                                  className="hidden"
                                />
                                <label
                                  htmlFor="upload-second-image"
                                  className="inline-flex items-center px-4 py-2 border border-purple-500 rounded-md text-purple-300 hover:bg-purple-800/30 cursor-pointer transition-colors"
                                >
                                  <ImageIcon className="w-5 h-5 mr-2" />
                                  Upload Second Image
                                </label>
                              </>
                            )}
                            <div className="text-xs text-purple-300/70 italic">
                              <p>Image will be placed at position: 180px from top, 288px from left</p>
                              <p>Size: 378 × 113 pixels (bottom billboard)</p>
                            </div>
                          </div>
                        </div>

                        {/* Credit cost note */}
                        <div className="text-xs text-purple-300/70 italic text-center">
                          <p>Generating an image costs 1 credit</p>
                        </div>

                        {/* Generate Button for Billboard */}
                        <Button
                          onClick={handleSubmit}
                          disabled={
                            isSubmitting || !uploadedImage || !uploadedSecondImage || isCanvasLoading || userCredits < 1
                          }
                          className="w-full bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-600 hover:to-violet-800 text-white font-medium py-5 mt-4"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin mr-2" />
                              <span>Generating...</span>
                            </div>
                          ) : userCredits < 1 ? (
                            <div className="flex items-center justify-center">
                              <Gift className="w-5 h-5 mr-2" />
                              <span>Need Credits</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 mr-2" />
                              <span>Generate Billboard</span>
                            </div>
                          )}
                        </Button>

                        {/* Redeem button when no credits */}
                        {userCredits < 1 && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button
                              onClick={() => router.push("/redeem")}
                              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-medium py-5"
                            >
                              <Key className="w-5 h-5 mr-2" />
                              <span>Redeem Key</span>
                            </Button>

                            <Button
                              onClick={() => setShowKeyPurchaseModal(true)}
                              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-medium py-5"
                            >
                              <ShoppingCart className="w-5 h-5 mr-2" />
                              <span>Buy Keys</span>
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <h3 className="text-sm font-medium text-purple-300 flex items-center">
                          <span className="inline-block w-1 h-4 bg-purple-500 mr-2 rounded-full"></span>
                          Upload Image:
                        </h3>
                        <div className="bg-gray-800/40 border border-purple-900/50 rounded-md p-4">
                          <div className="flex flex-col items-center justify-center gap-3">
                            {uploadedImage ? (
                              <div className="relative w-full">
                                <img
                                  src={uploadedImage || "/placeholder.svg"}
                                  alt="Uploaded image"
                                  className="w-full h-auto max-h-48 object-contain rounded-md"
                                />
                                <Button
                                  onClick={() => setUploadedImage(null)}
                                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e)}
                                  id="upload-image"
                                  className="hidden"
                                />
                                <label
                                  htmlFor="upload-image"
                                  className="inline-flex items-center px-4 py-2 border border-purple-500 rounded-md text-purple-300 hover:bg-purple-800/30 cursor-pointer transition-colors"
                                >
                                  <ImageIcon className="w-5 h-5 mr-2" />
                                  Upload Image
                                </label>
                              </>
                            )}
                            <div className="text-xs text-purple-300/70 italic">
                              <p>Image will be placed at position: 100px from top, 310px from left</p>
                              <p>Size: 380 × 200 pixels</p>
                            </div>
                          </div>
                        </div>

                        {/* Credit cost note */}
                        <div className="text-xs text-purple-300/70 italic text-center">
                          <p>Generating an image costs 1 credit</p>
                        </div>

                        {/* Generate Button for Billboard */}
                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmitting || !uploadedImage || isCanvasLoading || userCredits < 1}
                          className="w-full bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-600 hover:to-violet-800 text-white font-medium py-5 mt-4"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin mr-2" />
                              <span>Generating...</span>
                            </div>
                          ) : userCredits < 1 ? (
                            <div className="flex items-center justify-center">
                              <Gift className="w-5 h-5 mr-2" />
                              <span>Need Credits</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 mr-2" />
                              <span>Generate Billboard</span>
                            </div>
                          )}
                        </Button>

                        {/* Redeem button when no credits */}
                        {userCredits < 1 && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button
                              onClick={() => router.push("/redeem")}
                              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-medium py-5"
                            >
                              <Key className="w-5 h-5 mr-2" />
                              <span>Redeem Key</span>
                            </Button>

                            <Button
                              onClick={() => setShowKeyPurchaseModal(true)}
                              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-medium py-5"
                            >
                              <ShoppingCart className="w-5 h-5 mr-2" />
                              <span>Buy Keys</span>
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </Tabs>
            </div>
          </CardContent>
        )}

        <CardFooter className="py-4 bg-gray-900/40 border-t border-purple-700/50 text-center">
          {generatedImage && (
            <div className="space-y-4 w-full">
              <div className="relative rounded-md overflow-hidden shadow-md border border-purple-700/50">
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated Fansign"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: "300px" }}
                />
              </div>

              {/* Download and Share Options */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {/* Download Button */}
                <Button
                  onClick={() => {
                    if (!generatedImage) {
                      setErrorMessage("No image available to download. Please generate an image first.")
                      return
                    }

                    // Create a temporary link element
                    const link = document.createElement("a")
                    link.href = generatedImage
                    link.download = "fansign.png" // Filename for the downloaded image

                    // Programmatically trigger the download
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)

                    // Show download instructions
                    setShowDownloadInstructions(true)
                  }}
                  disabled={!generatedImage}
                  className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>

                {/* Generate Download Link Button */}
                <Button
                  onClick={generateDownloadLink}
                  disabled={isGeneratingLink || !generatedImage}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white"
                >
                  {isGeneratingLink ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Generating Link...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Share2 className="w-4 h-4 mr-2" />
                      <span>Generate Link</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Download Instructions */}
              {showDownloadInstructions && (
                <div className="text-sm text-green-300 italic">
                  <p>
                    If the download didn't start automatically, right-click on the image and select "Save Image As..."
                  </p>
                </div>
              )}

              {/* Display Download Link */}
              {downloadLink && (
                <div className="space-y-2">
                  <p className="text-sm text-blue-300">Shareable Download Link:</p>
                  <div className="flex items-center space-x-2">
                    <div className="truncate text-blue-400 flex-1 text-sm">{downloadLink}</div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={openDownloadLink}
                      className="border-blue-500 text-blue-400 hover:bg-blue-900/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyDownloadLink}
                      className="border-blue-500 text-blue-400 hover:bg-blue-900/20"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default FansignRequest
