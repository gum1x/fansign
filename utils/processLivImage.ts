import type React from "react"
export async function processLivImage(
  requestText: string,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  vt323FontFamily: string,
) {
  if (!requestText.trim()) return false

  try {
    // Load the image with explicit error handling
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Use the direct URL to the image
    img.src = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1076.JPG-VQMAwjnByZX1oMtvD1Dnwu0A6W90L4.jpeg"

    console.log("Loading LIV image from:", img.src)

    // Add a fallback mechanism in case the image fails to load
    let imageLoaded = false

    // Wait for the image to load with explicit error handling and timeout
    await Promise.race([
      new Promise((resolve, reject) => {
        img.onload = () => {
          console.log("LIV image loaded successfully, dimensions:", img.width, "x", img.height)
          imageLoaded = true
          resolve(null)
        }
        img.onerror = (e) => {
          console.error("Failed to load LIV image:", e)
          console.error("Image URL attempted:", img.src)
          reject(new Error(`Failed to load LIV image: ${JSON.stringify(e)}`))
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Image load timeout after 10 seconds")), 10000)),
    ])

    // If image failed to load, create a blank canvas with the LIV text
    if (!imageLoaded) {
      console.log("Using fallback blank canvas for LIV sign")
      const canvas = canvasRef.current
      if (!canvas) {
        throw new Error("Canvas reference is not available")
      }

      // Create a blank canvas with dimensions
      canvas.width = 800
      canvas.height = 600
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas 2D context")
      }

      // Fill with black background
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add colorful border to simulate the LIV sign
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#ff0099")
      gradient.addColorStop(0.33, "#00ffff")
      gradient.addColorStop(0.66, "#ffff00")
      gradient.addColorStop(1, "#ff0099")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 20
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

      // Add "LIV" text at the top
      ctx.font = "bold 80px Arial"
      ctx.textAlign = "center"
      ctx.fillStyle = "#ffffff"
      // Save context for rotation
      ctx.save()
      ctx.translate(canvas.width / 2, 80)
      ctx.rotate(-0.05) // Slight tilt to the left
      ctx.fillText("LIV", 0, 0)
      ctx.restore()

      // Continue with the user's text...
    }

    // If the image loaded successfully, continue with the original code...
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

    // Add the user's text in the center with LED effect
    const text = requestText.toUpperCase()
    const fontSize = Math.min(64, 640 / text.length)

    // Position the text to the left and a bit lower
    const textXPos = canvas.width * 0.42 // Position text at 42% from the left edge (slightly left of previous 45%)
    const textYPos = canvas.height * 0.4 // Position text lower (40% from the top instead of 30%)

    // Save the current context state before applying transformations
    ctx.save()

    // Move to the text position, apply rotation, then move back
    ctx.translate(textXPos, textYPos)
    ctx.rotate(-0.1) // Increased tilt to the left (more negative angle)
    ctx.translate(-textXPos, -textYPos)

    // Apply the VT323 font (or fallback to monospace)
    ctx.font = `${fontSize}px ${vt323FontFamily}, monospace`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Create a glowing effect for the LED text
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
    ctx.shadowBlur = 15
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.fillText(text, textXPos, textYPos)

    // Then draw the main text
    ctx.shadowBlur = 5
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillText(text, textXPos, textYPos)

    // Finally draw the sharp text on top
    ctx.shadowBlur = 0
    ctx.fillStyle = "#ffffff"
    ctx.fillText(text, textXPos, textYPos)

    // Restore the context state to remove transformations
    ctx.restore()

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    console.log("Canvas converted to data URL")
    return dataUrl
  } catch (error) {
    console.error("Error processing LIV image:", error)
    throw error
  }
}
