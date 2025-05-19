import type React from "react"
import { renderScribeText } from "./scribeTextRenderer"

export async function processBophousePhoneImage(requestText: string, canvasRef: React.RefObject<HTMLCanvasElement>) {
  if (!requestText.trim()) return false

  try {
    // Load the image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "/images/bophouse-phone-template.jpeg"

    console.log("Loading Bophouse Phone image from:", img.src)

    // Wait for the image to load with explicit promise handling
    await new Promise((resolve, reject) => {
      img.onload = () => {
        console.log("Bophouse Phone image loaded successfully, dimensions:", img.width, "x", img.height)
        resolve(null)
      }
      img.onerror = (e) => {
        console.error("Failed to load Bophouse Phone image:", e)
        reject(new Error("Failed to load Bophouse Phone image"))
      }
    })

    // Set up canvas
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

    // Draw the original image
    ctx.drawImage(img, 0, 0)

    // Define the text boundaries as specified
    const boundaries = {
      top: 527,
      bottom: 671,
      left: 455,
      right: 592,
    }

    // Calculate available space
    const availableWidth = boundaries.right - boundaries.left
    const availableHeight = boundaries.bottom - boundaries.top

    // Check if any word is 6 characters or longer
    const words = requestText.split(" ")
    const hasLongWord = words.some((word) => word.length >= 6)

    // Find the longest word length for more precise adjustment
    const longestWordLength = Math.max(...words.map((word) => word.length))

    // Calculate center point of the text area with dynamic shifting
    // Apply different shifts based on conditions:
    // 1. Base shift of 18px left for all cases (original 10px + additional 8px)
    // 2. Shift 12px left when there are multiple words
    // 3. For words 6 characters or longer, apply a progressive shift:
    //    - 10px for 6 characters
    //    - Additional 2px for each character beyond 6 (up to a max)
    const wordCount = words.length
    const horizontalShift = wordCount > 1 ? 12 : 0

    // Progressive shift based on longest word length
    let longWordShift = 0
    if (longestWordLength >= 6) {
      // Base shift of 10px for 6-character words
      longWordShift = 10

      // Add 2px for each additional character beyond 6, up to a maximum of 20px total
      if (longestWordLength > 6) {
        const additionalShift = Math.min((longestWordLength - 6) * 2, 10)
        longWordShift += additionalShift
      }
    }

    const centerX = (boundaries.left + boundaries.right) / 2 - horizontalShift - 18 - longWordShift
    const centerY = (boundaries.top + boundaries.bottom) / 2 - 10 // Move 10px up

    console.log(
      `Text positioning: wordCount=${wordCount}, longestWord=${longestWordLength} chars, ` +
        `baseShift=18px, multiWordShift=${horizontalShift}px, longWordShift=${longWordShift}px, ` +
        `totalShift=${horizontalShift + 18 + longWordShift}px`,
    )

    // Process text into lines that respect the horizontal boundaries
    const lines: string[] = []
    let currentLine = ""

    // Set up temporary context for measuring text
    ctx.font = "26px Arial" // Approximate size for measurement

    // Reduce the maximum width to prevent text from extending too far right
    const maxLineWidth = availableWidth * 0.75 // More restrictive width

    // Process words into lines
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const testWidth = ctx.measureText(testLine).width

      // If adding this word would exceed the width, start a new line
      if (testWidth > maxLineWidth && currentLine !== "") {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    // Add the last line
    if (currentLine) {
      lines.push(currentLine)
    }

    // Limit to 3 lines maximum to fit in the phone screen
    if (lines.length > 3) {
      // If more than 3 lines, combine the last lines
      const extraLines = lines.slice(2).join(" ")
      lines.splice(2, lines.length - 2, extraLines)
    }

    console.log("Text split into lines:", lines)

    // Calculate vertical positioning based on number of lines
    const lineHeight = 32 // Tighter line spacing
    const totalTextHeight = lines.length * lineHeight
    const startY = centerY - totalTextHeight / 2 + lineHeight / 2

    // Render each line separately
    for (let i = 0; i < lines.length; i++) {
      const lineY = startY + i * lineHeight

      // Use the scribe text renderer for each line
      const options = {
        fontSize: 26, // Slightly smaller font size
        lineHeight: 0, // No additional line height since we're manually positioning
        maxWidth: maxLineWidth, // Respect horizontal boundaries
        textAlign: "center",
        color: "#000000",
        shadowColor: "rgba(255, 255, 255, 0.5)",
        shadowBlur: 2,
        fontWeight: "normal",
        letterSpacing: -0.5, // Slightly tighter letter spacing
      }

      await renderScribeText(ctx, lines[i], centerX, lineY, options)
    }

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    console.log("Bophouse Phone image processing complete")
    return dataUrl
  } catch (error) {
    console.error("Error processing Bophouse Phone image:", error)
    throw error
  }
}
