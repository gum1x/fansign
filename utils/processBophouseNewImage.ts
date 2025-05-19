import type React from "react"
import { renderScribeText } from "./scribeTextRenderer"

export async function processBophouseNewImage(requestText: string, canvasRef: React.RefObject<HTMLCanvasElement>) {
  if (!requestText.trim()) return false

  try {
    // Process input to ensure exactly two words
    let words = requestText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)

    // If more than 2 words, keep only the first 2
    if (words.length > 2) {
      words = words.slice(0, 2)
      console.log("Input had more than 2 words, truncated to:", words.join(" "))
    }

    // If only 1 word, add a default second word
    if (words.length === 1) {
      words.push("fan")
      console.log("Input had only 1 word, added default second word:", words.join(" "))
    }

    // If somehow we still don't have exactly 2 words, return false
    if (words.length !== 2) {
      console.error("Failed to process input to exactly 2 words")
      return false
    }

    // Join the words back with a space for processing
    const processedText = words.join(" ")

    // Load the image with explicit error handling
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Use the full URL to the image to avoid path issues
    img.src = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1136.JPG-45Dhw5868FFua9u5UQT8VTJ81BKpfq.jpeg"

    console.log("Loading new bophouse image from:", img.src)

    // Wait for the image to load with explicit error handling
    await new Promise((resolve, reject) => {
      img.onload = () => {
        console.log("New bophouse image loaded successfully, dimensions:", img.width, "x", img.height)
        resolve(null)
      }
      img.onerror = (e) => {
        console.error("Failed to load new bophouse image:", e)
        reject(new Error("Failed to load new bophouse image"))
      }
    })

    // Set up canvas with checks
    const canvas = canvasRef.current
    if (!canvas) {
      throw new Error("Canvas reference is not available")
    }

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
    const text = processedText // Use the processed text with exactly 2 words

    // Define the exact constraints for text placement based on the provided measurements
    // Image dimensions: 959 × 1610 pixels
    const imageWidth = 959
    const imageHeight = 1610

    // Calculate scaling factors if the loaded image dimensions differ from the expected dimensions
    const scaleX = img.width / imageWidth
    const scaleY = img.height / imageHeight

    // Define the exact constraints with scaling applied and improved padding
    // Add more horizontal padding to make text appear more centered on the screen
    const constraints = {
      left: 457 * scaleX + 20, // Add 20px padding from left
      right: (imageWidth - 366) * scaleX - 20, // Add 20px padding from right
      top: 525 * scaleY + 5, // Add 5px padding from top
      bottom: (imageHeight - 931) * scaleY - 5, // Add 5px padding from bottom
    }

    // Calculate available space with the new padding
    const availableWidth = constraints.right - constraints.left
    const availableHeight = constraints.bottom - constraints.top

    console.log("Text constraints:", constraints)
    console.log("Available space:", availableWidth, "x", availableHeight)

    // Calculate font size based on text length and available space
    // For exactly 2 words, we can optimize the font size calculation
    const textLength = text.length
    let baseFontSize

    // Calculate the base font size - reduced by approximately 30% from previous values
    // For 2 words, we'll use a more conservative font size
    if (textLength <= 10) {
      // Short text (2 short words)
      baseFontSize = Math.min(70, availableWidth / (words[0].length * 0.5)) // Reduced from 100
    } else if (textLength <= 16) {
      // Medium length text (2 medium words)
      baseFontSize = Math.min(60, availableWidth / (Math.max(words[0].length, words[1].length) * 0.55)) // Reduced from 85
    } else {
      // Longer text (2 longer words)
      baseFontSize = Math.min(50, availableWidth / (Math.max(words[0].length, words[1].length) * 0.6)) // Reduced from 70
    }

    // Apply a safety factor to ensure text stays within boundaries
    const safetyFactor = 0.85 // Slightly increased from 0.8 for better visibility

    baseFontSize *= safetyFactor

    console.log("Base font size for 2 words:", baseFontSize)

    // Create a temporary canvas for the scribe text
    const textCanvas = document.createElement("canvas")
    textCanvas.width = availableWidth // Exactly match available width
    textCanvas.height = availableHeight // Exactly match available height
    const textCtx = textCanvas.getContext("2d")

    if (!textCtx) {
      throw new Error("Could not get text canvas 2D context")
    }

    // For exactly 2 words, always put them on separate lines for optimal display
    const textToRender = words.join("\n")
    const lineHeight = 1.2 // Good spacing for 2 lines

    console.log("Text to render (2 words on separate lines):", textToRender)
    console.log("Base font size:", baseFontSize)
    console.log("Line height:", lineHeight)

    // Use our scribe text renderer with custom parameters for a pen-like effect
    renderScribeText(textCtx, textToRender, 0, textCanvas.height * 0.1, textCanvas.width, textCanvas.height, {
      style: "handwritten",
      color: "rgba(0, 0, 0, 0.85)",
      fontSize: baseFontSize,
      lineHeight: lineHeight,
      align: "center",
      maxWidth: textCanvas.width * 0.95, // Ensure text stays within canvas with margin
      customParams: {
        // Customize parameters for a more pen-like effect with larger text
        lineWidth: 3.2, // Increased for better visibility with larger text
        jitter: 0.18, // Reduced jitter for cleaner text with larger size
        slant: 0.06, // Very slight rightward slant (reduced as requested)
        inkAmount: 0.92, // More ink for darker text with larger size
        charSpacing: 0.6, // Tighter character spacing for larger text
        charJitter: 0.16, // Less character variation for cleaner text with larger size
        curveNoise: 0.28, // Moderate curve variation
        pressure: 0.88, // Higher pressure for better visibility with larger text
        pressureVariation: 0.18, // Reduced variation for more consistent appearance
      },
    })

    // Calculate the exact position to center the text within the constraints
    // Ensure we're exactly within the specified boundaries
    const textX = constraints.left
    // Keep the text moved down by 10 pixels as previously requested
    const textY = constraints.top + 10 * scaleY

    // Draw the text canvas onto the main canvas at the exact position
    ctx.drawImage(textCanvas, textX, textY, availableWidth, availableHeight)

    console.log("Text rendered to canvas with scribe handwriting effect")
    console.log("Text position:", textX, textY, "moved down by 10px")
    console.log("Text dimensions:", availableWidth, "x", availableHeight)

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    console.log("Canvas converted to data URL")
    return dataUrl
  } catch (error) {
    console.error("Error processing new bophouse image:", error)
    throw error
  }
}
