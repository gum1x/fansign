import type React from "react"
import { renderScribeText } from "./scribeTextRenderer"

export async function processDoubleMonkeyImage(requestText: string, canvasRef: React.RefObject<HTMLCanvasElement>) {
  if (!requestText.trim()) return false

  try {
    // Load the image with explicit error handling
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Use the provided image URL - using the direct blob URL to ensure it loads
    img.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-05%20at%2010.jpg-S12CeanADthNRBsbZztHcKmgSilm0S.jpeg"

    console.log("Loading Double Monkey image from:", img.src)

    // Wait for the image to load with explicit error handling
    await new Promise((resolve, reject) => {
      img.onload = () => {
        console.log("Double Monkey image loaded successfully, dimensions:", img.width, "x", img.height)
        resolve(null)
      }
      img.onerror = (e) => {
        console.error("Failed to load Double Monkey image:", e)
        reject(new Error("Failed to load Double Monkey image"))
      }
    })

    // Set up canvas with checks
    const canvas = canvasRef.current
    if (!canvas) {
      throw new Error("Canvas reference is not available")
    }

    // Calculate scaling factors based on expected image dimensions
    const expectedWidth = 1080 // Approximate width of the Double Monkey image
    const expectedHeight = 1080 // Approximate height of the Double Monkey image
    const scaleX = img.width / expectedWidth
    const scaleY = img.height / expectedHeight

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

    // Define the constraints for text placement based on the requirements
    // No lower than 438px from the bottom
    // No higher than 810px from the top
    // No more right than 388px from the right
    // No more left than 13px from the right
    const constraints = {
      top: 810 * scaleY, // Maximum distance from top
      bottom: img.height - 438 * scaleY, // Minimum distance from bottom
      left: img.width - 388 * scaleX, // Maximum distance from left
      right: img.width - 13 * scaleX, // Minimum distance from right
    }

    // Calculate available space
    const availableWidth = constraints.right - constraints.left
    const availableHeight = constraints.bottom - constraints.top

    // Calculate font size based on text length and available width
    // For script-like font, we'll use a medium base size
    const baseFontSize = Math.min(50, availableWidth / (text.length * 0.25) / 1.8)

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

    // If text is longer than 8 characters, consider splitting it
    if (text.length > 8) {
      // Find a good place to split (preferably at a space)
      const words = text.split(" ")

      if (words.length > 1) {
        // If there are multiple words, split them into lines
        const midPoint = Math.floor(words.length / 2)
        const firstLine = words.slice(0, midPoint).join(" ")
        const secondLine = words.slice(midPoint).join(" ")
        textToRender = firstLine + "\n" + secondLine
      } else if (text.length > 10) {
        // If it's a single long word, split it in half
        const midPoint = Math.floor(text.length / 2)
        textToRender = text.substring(0, midPoint) + "\n" + text.substring(midPoint)
      }
    }

    // Increase line height for better spacing
    const lineHeight = 2.0 // Increased from default 1.5

    // Use our scribe text renderer with custom parameters for a cursive effect
    renderScribeText(textCtx, textToRender, 0, textCanvas.height / 4, textCanvas.width, textCanvas.height, {
      style: "cursive",
      color: "rgba(25, 25, 112, 0.9)", // Dark blue like in the reference image
      fontSize: baseFontSize,
      lineHeight: lineHeight, // Use the increased line height
      align: "center",
      customParams: {
        // Customize parameters for a more cursive-like effect
        lineWidth: 2.2, // Medium line width
        jitter: 0.25, // Moderate jitter
        slant: 0.2, // Moderate rightward slant
        inkAmount: 0.85, // Good ink amount
        charSpacing: 1.0, // Normal character spacing
        charJitter: 0.3, // Moderate character variation
        curveNoise: 0.45, // Moderate curve variation
        pressure: 0.7, // Medium pressure
        pressureVariation: 0.35, // Moderate pressure variation
      },
    })

    // Draw the text canvas onto the main canvas
    // Apply the requested position adjustments
    const offsetX = (Math.random() - 0.5) * baseFontSize * 0.2
    const offsetY = (Math.random() - 0.5) * baseFontSize * 0.2

    // Original position calculation
    const originalX = constraints.left + (availableWidth - textCanvas.width) / 2 + textCanvas.width * 0.1 + offsetX
    const originalY = constraints.top + (availableHeight - textCanvas.height) / 2 + textCanvas.height * 0.1 + offsetY

    // Apply the requested adjustments with scaling
    // Now moving 410 + 43 + 36 + 52 + 48 + 29 = 618 pixels to the left
    const textX = originalX - (410 + 43 + 36 + 52 + 48 + 29) * scaleX // Move 618 pixels to the left
    // Now moving 48 + 12 = 60 pixels up
    const textY = originalY - (48 + 12) * scaleY // Move 60 pixels up

    ctx.drawImage(textCanvas, textX, textY)

    console.log("Text rendered to canvas with scribe cursive effect")
    console.log("Text position adjusted: 618px left, 60px up")

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    console.log("Canvas converted to data URL")
    return dataUrl
  } catch (error) {
    console.error("Error processing Double Monkey image:", error)
    throw error
  }
}
