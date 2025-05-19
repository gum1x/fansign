import type React from "react"
export async function processBophouseImage(requestText: string, canvasRef: React.RefObject<HTMLCanvasElement>) {
  if (!requestText.trim()) return false

  try {
    // Load the image with explicit error handling
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Use the full URL to the image to avoid path issues
    img.src = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1064.JPG-fIkmk9Jp6D6OZHlDhoxgpeUDAHzI3w.jpeg"

    console.log("Loading bophouse image from:", img.src)

    // Wait for the image to load with explicit error handling
    await new Promise((resolve, reject) => {
      img.onload = () => {
        console.log("Bophouse image loaded successfully, dimensions:", img.width, "x", img.height)
        resolve(null)
      }
      img.onerror = (e) => {
        console.error("Failed to load bophouse image:", e)
        reject(new Error("Failed to load bophouse image"))
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

    // Sample colors from the banner area for text integration
    const bannerY = img.height / 2 - 10
    const bannerX = img.width / 2
    const sampleRadius = 50

    // Get image data from the banner area
    const imageData = ctx.getImageData(
      bannerX - sampleRadius,
      bannerY - sampleRadius,
      sampleRadius * 2,
      sampleRadius * 2,
    )

    // Calculate average color in the banner area
    let r = 0,
      g = 0,
      b = 0,
      count = 0
    for (let i = 0; i < imageData.data.length; i += 4) {
      r += imageData.data[i]
      g += imageData.data[i + 1]
      b += imageData.data[i + 2]
      count++
    }

    r = Math.floor(r / count)
    g = Math.floor(g / count)
    b = Math.floor(b / count)

    // Calculate complementary color for text
    const textR = Math.max(0, Math.min(255, 255 - r + 50))
    const textG = Math.max(0, Math.min(255, 255 - g + 50))
    const textB = Math.max(0, Math.min(255, 255 - b + 50))

    console.log("Sampled background color:", r, g, b)
    console.log("Calculated text color:", textR, textG, textB)

    // Define the text parameters
    const text = requestText.toUpperCase()

    // Calculate a better font size based on text length
    const fontSize = Math.min(70, 700 / Math.max(text.length, 5)) // Adjusted scaling

    // Set font with bold style for better visibility
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    console.log("Text parameters set:", text, "fontSize:", fontSize)

    // Measure text width to ensure it fits within the banner
    const textMetrics = ctx.measureText(text)
    const textWidth = textMetrics.width

    // Define the position with better vertical positioning
    const textX = img.width / 2
    const textY = img.height / 2 - 10 // Moved up slightly for better positioning

    console.log("Text position:", textX, textY, "Text width:", textWidth)

    // Create a temporary canvas for text effects
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext("2d")

    if (!tempCtx) {
      throw new Error("Could not get temporary canvas 2D context")
    }

    // Clear the temporary canvas
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)

    // Set up text on temporary canvas
    tempCtx.font = ctx.font
    tempCtx.textAlign = ctx.textAlign
    tempCtx.textBaseline = ctx.textBaseline

    // TECHNIQUE 1: Add base text with slight transparency
    tempCtx.fillStyle = `rgba(${textR}, ${textG}, ${textB}, 0.9)`
    tempCtx.fillText(text, textX, textY)

    // TECHNIQUE 2: Add inner shadow
    tempCtx.shadowColor = `rgba(0, 0, 0, 0.4)`
    tempCtx.shadowBlur = 3
    tempCtx.shadowOffsetX = 1
    tempCtx.shadowOffsetY = 1
    tempCtx.fillStyle = `rgba(${textR}, ${textG}, ${textB}, 0.2)`
    tempCtx.fillText(text, textX, textY)

    // Reset shadow
    tempCtx.shadowColor = "transparent"
    tempCtx.shadowBlur = 0
    tempCtx.shadowOffsetX = 0
    tempCtx.shadowOffsetY = 0

    // TECHNIQUE 3: Add subtle outline
    tempCtx.strokeStyle = `rgba(${textR}, ${textG}, ${textB}, 0.7)`
    tempCtx.lineWidth = 1
    tempCtx.strokeText(text, textX, textY)

    // TECHNIQUE 4: Add highlight
    tempCtx.shadowColor = "rgba(255, 255, 255, 0.3)"
    tempCtx.shadowBlur = 4
    tempCtx.shadowOffsetX = -1
    tempCtx.shadowOffsetY = -1
    tempCtx.fillStyle = `rgba(${textR + 30}, ${textG + 30}, ${textB + 30}, 0.3)`
    tempCtx.fillText(text, textX, textY)

    // Reset shadow
    tempCtx.shadowColor = "transparent"
    tempCtx.shadowBlur = 0
    tempCtx.shadowOffsetX = 0
    tempCtx.shadowOffsetY = 0

    // TECHNIQUE 5: Add main text with slight noise
    tempCtx.fillStyle = `rgba(${textR}, ${textG}, ${textB}, 0.95)`
    tempCtx.fillText(text, textX, textY)

    // TECHNIQUE 6: Add noise to the text
    const textImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
    for (let i = 0; i < textImageData.data.length; i += 4) {
      // Only add noise to non-transparent pixels (text pixels)
      if (textImageData.data[i + 3] > 0) {
        const noise = Math.random() * 20 - 10
        textImageData.data[i] = Math.max(0, Math.min(255, textImageData.data[i] + noise))
        textImageData.data[i + 1] = Math.max(0, Math.min(255, textImageData.data[i + 1] + noise))
        textImageData.data[i + 2] = Math.max(0, Math.min(255, textImageData.data[i + 2] + noise))
      }
    }
    tempCtx.putImageData(textImageData, 0, 0)

    // TECHNIQUE 7: Apply a subtle blur to soften edges
    // (We'll simulate this with a very slight shadow since we can't use filter)
    tempCtx.shadowColor = `rgba(${textR}, ${textG}, ${textB}, 0.3)`
    tempCtx.shadowBlur = 1
    tempCtx.shadowOffsetX = 0
    tempCtx.shadowOffsetY = 0
    tempCtx.fillStyle = "rgba(0, 0, 0, 0.1)"
    tempCtx.fillText(text, textX, textY)

    // Reset shadow
    tempCtx.shadowColor = "transparent"
    tempCtx.shadowBlur = 0

    // TECHNIQUE 8: Add a final layer with slight color variation
    const gradientColors = [
      `rgba(${textR + 20}, ${textG + 20}, ${textB + 20}, 0.7)`,
      `rgba(${textR}, ${textG}, ${textB}, 0.8)`,
      `rgba(${textR - 20}, ${textG - 20}, ${textB - 20}, 0.7)`,
    ]

    const gradient = tempCtx.createLinearGradient(
      textX - textWidth / 2,
      textY - fontSize / 2,
      textX + textWidth / 2,
      textY + fontSize / 2,
    )

    gradient.addColorStop(0, gradientColors[0])
    gradient.addColorStop(0.5, gradientColors[1])
    gradient.addColorStop(1, gradientColors[2])

    tempCtx.fillStyle = gradient
    tempCtx.fillText(text, textX, textY)

    // TECHNIQUE 9: Apply composite operation to blend with background
    ctx.globalCompositeOperation = "overlay"
    ctx.drawImage(tempCanvas, 0, 0)

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over"

    // Add a final layer with normal blending for readability
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillText(text, textX, textY)

    console.log("Text rendered to canvas with multiple blending techniques")

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    console.log("Canvas converted to data URL")
    return dataUrl
  } catch (error) {
    console.error("Error processing bophouse image:", error)
    throw error
  }
}
