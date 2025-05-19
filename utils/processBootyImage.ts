import type React from "react"
import { renderScribeText } from "./scribeTextRenderer"

export async function processBootyImage(requestText: string, canvasRef: React.RefObject<HTMLCanvasElement>) {
  if (!requestText.trim()) return false

  try {
    // Load the image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "/images/booty-template.jpeg"

    console.log("Loading Booty image from:", img.src)

    // Wait for the image to load with explicit promise handling
    await new Promise((resolve, reject) => {
      img.onload = () => {
        console.log("Booty image loaded successfully, dimensions:", img.width, "x", img.height)
        resolve(null)
      }
      img.onerror = (e) => {
        console.error("Failed to load Booty image:", e)
        reject(new Error("Failed to load Booty image"))
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
    const text = requestText // Keep original case for more natural look

    // Define the constraints for text placement based on the provided specifications
    const constraints = {
      top: 386, // No higher than 386px from the top
      bottom: img.height - 928, // No lower than 928px from the bottom
      left: 298, // No more left than 298px from the left
      right: img.width - 278, // No more right than 278px from the right
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
    // Position it centered within the constraints
    const textX = constraints.left + (availableWidth - textCanvas.width) / 2 + textCanvas.width * 0.05
    const textY = constraints.top + (availableHeight - textCanvas.height) / 2 + 120

    ctx.drawImage(textCanvas, textX, textY)

    console.log("Text rendered to canvas with script-like effect, font:", "cursive", "at size:", baseFontSize)

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    console.log("Canvas converted to data URL")
    return dataUrl
  } catch (error) {
    console.error("Error processing Booty image:", error)
    throw error
  }
}
