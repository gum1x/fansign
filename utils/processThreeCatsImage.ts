import type React from "react"
import { renderScribeText } from "./scribeTextRenderer"

export async function processThreeCatsImage(requestText: string, canvasRef: React.RefObject<HTMLCanvasElement>) {
  if (!requestText.trim()) return false

  try {
    // Load the image with explicit error handling
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Use the correct image URL provided by the user
    img.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-04-16_03-03-06.jpg-zTOcfTscZ9yF9I0lS86inZ59NpBRAN.jpeg"

    console.log("Loading Three Cats image from:", img.src)

    // Add a fallback mechanism in case the image fails to load
    let imageLoaded = false

    // Wait for the image to load with explicit error handling and timeout
    await Promise.race([
      new Promise((resolve, reject) => {
        img.onload = () => {
          console.log("Three Cats image loaded successfully, dimensions:", img.width, "x", img.height)
          imageLoaded = true
          resolve(null)
        }
        img.onerror = (e) => {
          console.error("Failed to load Three Cats image:", e)
          console.error("Image URL attempted:", img.src)
          reject(new Error(`Failed to load Three Cats image: ${JSON.stringify(e)}`))
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Image load timeout after 10 seconds")), 10000)),
    ])

    // Set up canvas with checks
    const canvas = canvasRef.current
    if (!canvas) {
      throw new Error("Canvas reference is not available")
    }

    // Calculate scaling factors if the loaded image dimensions differ from the expected dimensions
    const imageWidth = 1080 // Approximate width of the Three Cats image
    const imageHeight = 1080 // Approximate height of the Three Cats image
    const scaleX = img.width / imageWidth
    const scaleY = img.height / imageHeight

    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get canvas 2D context")
    }

    console.log("Canvas setup complete:", canvas.width, "x", canvas.height)

    // Draw the original image
    ctx.drawImage(img, 0, 0)
    console.log("Image drawn to canvas")

    // Define the text parameters
    const text = requestText // Keep original case for more natural look

    // Define the constraints for text placement - for the Three Cats image
    // These values are specifically for the white card area in the image
    const constraints = {
      top: img.height * 0.6, // Position on the white card
      bottom: img.height * 0.95,
      left: img.width * 0.15, // More to the left
      right: img.width * 0.75,
    }

    // Calculate available space
    const availableWidth = constraints.right - constraints.left
    const availableHeight = constraints.bottom - constraints.top

    // Calculate font size based on text length and available width
    const baseFontSize = Math.min(65, availableWidth / (text.length * 0.2) / 1.3)

    // Create a temporary canvas for the scribe text
    const textCanvas = document.createElement("canvas")
    textCanvas.width = availableWidth * 1.3 // Add padding for letter variations
    textCanvas.height = availableHeight * 1.6 // Add padding for letter variations
    const textCtx = textCanvas.getContext("2d")

    if (!textCtx) {
      throw new Error("Could not get text canvas 2D context")
    }

    // Split text into lines if it's too long
    let textToRender = text

    // IMPROVED LINE BREAKING ALGORITHM
    // Only split text if it's significantly long (more than 12 characters)
    // For shorter phrases like "you are gay", keep it on one line
    if (text.length > 12) {
      // Find a good place to split (preferably at a space)
      const words = text.split(" ")

      if (words.length > 1) {
        // If there are multiple words, split them into lines
        // For short phrases (3 words or less AND total length <= 15), keep on one line
        if (words.length <= 3 && text.length <= 15) {
          textToRender = text // Keep short phrases on one line
        } else {
          // For longer phrases, balance the lines
          const midPoint = Math.floor(words.length / 2)
          const firstLine = words.slice(0, midPoint).join(" ")
          const secondLine = words.slice(midPoint).join(" ")
          textToRender = firstLine + "\n" + secondLine
        }
      } else if (text.length > 15) {
        // If it's a single long word, split it in half
        const midPoint = Math.floor(text.length / 2)
        textToRender = text.substring(0, midPoint) + "\n" + text.substring(midPoint)
      }
    }

    // REDUCED line height for better spacing
    const lineHeight = 1.2 // Reduced from 2.0 to bring lines closer together

    // Use our scribe text renderer with custom parameters for a script-like effect
    renderScribeText(textCtx, textToRender, 0, textCanvas.height / 4, textCanvas.width, textCanvas.height, {
      style: "cursive",
      color: "rgba(25, 25, 112, 0.9)", // Dark blue like in the reference image
      fontSize: baseFontSize,
      lineHeight: lineHeight, // Use the reduced line height
      align: "center",
      customParams: {
        // Customize parameters for a more script-like effect
        lineWidth: 2.5, // Thicker lines for marker-like appearance
        jitter: 0.3, // Moderate jitter
        slant: 0.18, // Moderate rightward slant
        inkAmount: 0.9, // More ink for darker text
        charSpacing: 1.1, // Slightly wider character spacing
        charJitter: 0.25, // Moderate character variation
        curveNoise: 0.4, // Moderate curve variation
        pressure: 0.8, // Higher pressure for marker-like effect
        pressureVariation: 0.3,
      },
    })

    // Draw the text canvas onto the main canvas
    // Position it with the 76px vertical adjustment as previously requested
    const textX = constraints.left + (availableWidth - textCanvas.width) / 2 + textCanvas.width * 0.05
    const textY = constraints.top + (availableHeight - textCanvas.height) / 3 + 76 * scaleY

    ctx.drawImage(textCanvas, textX, textY)

    console.log("Text rendered to canvas with script-like effect, font:", "cursive", "at size:", baseFontSize)

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    console.log("Canvas converted to data URL")
    return dataUrl
  } catch (error) {
    console.error("Error processing Three Cats image:", error)
    throw error
  }
}
