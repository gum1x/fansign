import type React from "react"
export async function processLivDigitalImage(requestText: string, canvasRef: React.RefObject<HTMLCanvasElement>) {
  if (!requestText.trim()) return false

  try {
    // Load the image with explicit error handling
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Use the provided image URL
    img.src = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1112.JPG-ycFJnZXtoG4d3vQ9BVrXLhIF7NXxgr.jpeg"

    console.log("Loading Liv Digital image from:", img.src)

    // Wait for the image to load with explicit error handling
    await new Promise((resolve, reject) => {
      img.onload = () => {
        console.log("Liv Digital image loaded successfully, dimensions:", img.width, "x", img.height)
        resolve(null)
      }
      img.onerror = (e) => {
        console.error("Failed to load Liv Digital image:", e)
        reject(new Error("Failed to load Liv Digital image"))
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

    // Split the text into words
    const words = requestText.split(" ").filter((word) => word.trim() !== "")

    // Limit to 3 words maximum
    const displayWords = words.slice(0, 3)

    // Define the sign area using the exact pixel measurements provided
    // Image dimensions: 1179×1564 pixels
    const imageWidth = 1179
    const imageHeight = 1564

    // Calculate scaling factors if the loaded image dimensions differ from the expected dimensions
    const scaleX = img.width / imageWidth
    const scaleY = img.height / imageHeight

    // Sign position (scaled to match actual image dimensions)
    const signArea = {
      left: 136 * scaleX,
      top: 573 * scaleY,
      right: img.width - 612 * scaleX,
      bottom: img.height - 755 * scaleY,
    }

    // Calculate sign width and height
    const signWidth = signArea.right - signArea.left
    const signHeight = signArea.bottom - signArea.top

    // Define the three sections with exact vertical positioning constraints
    const sections = [
      {
        // First word: between 580px and 653px from top
        top: 580 * scaleY,
        bottom: 653 * scaleY,
        centerY: ((580 + 653) / 2 + 13) * scaleY, // Center point for text placement + 13px down
      },
      {
        // Second word: between 661px and 723px from top
        top: 661 * scaleY,
        bottom: 723 * scaleY,
        centerY: ((661 + 723) / 2 + 13) * scaleY, // Center point for text placement + 13px down
      },
      {
        // Third word: between 735px and 797px from top
        top: 735 * scaleY,
        bottom: 797 * scaleY,
        centerY: ((735 + 797) / 2 + 13) * scaleY, // Center point for text placement + 13px down
      },
    ]

    // Calculate horizontal center of the sign
    const centerX = signArea.left + signWidth / 2

    // Apply rotation to slant the text slightly to the left
    const rotationAngle = -0.05 // Slight negative angle to slant text to the left

    // Increased letter spacing for more spaced out letters
    const letterSpacing = 3 // Positive value to space letters further apart (changed from -1)

    // Select only 1-2 letters total across all words for gleams
    const allLetterPositions = []

    // Collect all possible letter positions
    displayWords.forEach((word, wordIndex) => {
      const letters = word.split("")
      letters.forEach((_, letterIndex) => {
        allLetterPositions.push({ wordIndex, letterIndex })
      })
    })

    // Shuffle the positions
    for (let i = allLetterPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allLetterPositions[i], allLetterPositions[j]] = [allLetterPositions[j], allLetterPositions[i]]
    }

    // Select only 1-2 positions for gleams
    const numGleams = Math.min(allLetterPositions.length, 1 + Math.floor(Math.random() * 2))
    const selectedGleams = allLetterPositions.slice(0, numGleams)

    // Create a map to easily check if a letter should have a gleam
    const gleamMap = new Map()
    selectedGleams.forEach(({ wordIndex, letterIndex }) => {
      if (!gleamMap.has(wordIndex)) {
        gleamMap.set(wordIndex, new Set())
      }
      gleamMap.get(wordIndex).add(letterIndex)
    })

    // Draw each word on its respective section based on the number of words
    displayWords.forEach((word, index) => {
      if (index >= sections.length) return // Skip if we have more words than sections

      // Calculate font size based on word length and section width
      // Make the font even smaller (reduced by 25%)
      const baseFontSize = Math.min(75, 600 / word.length) // Reduced from 100 to 75
      const fontSize = baseFontSize * 0.9

      // Set font for text - using Arial Black for more blocky appearance
      ctx.font = `bold ${fontSize}px "Arial Black", sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Determine which section to use based on the total number of words
      const sectionIndex = index

      // Save context for rotation and transformations
      ctx.save()

      // Apply special offset for the first word - move 32px to the left
      const wordOffset = index === 0 ? -32 : 0

      // Apply rotation around the text position
      ctx.translate(centerX + wordOffset, sections[sectionIndex].centerY)
      ctx.rotate(rotationAngle)

      // Make letters skinnier by scaling horizontally
      ctx.scale(0.7, 1) // 0.7 horizontal scale makes letters 30% skinnier

      // Base text color - medium gray
      const baseColor = "#444444"
      ctx.fillStyle = baseColor

      // For blocky letters with increased spacing, we need to draw each letter individually
      const letters = word.toUpperCase().split("")

      // Calculate total width with the new spacing
      let totalWidth = 0
      const letterWidths = []

      // Measure each letter
      for (const letter of letters) {
        const width = ctx.measureText(letter).width
        letterWidths.push(width)
        totalWidth += width
      }

      // Add spacing to total width
      totalWidth += (letters.length - 1) * letterSpacing

      // Start position for first letter
      let startX = -totalWidth / 2

      // Get the gleam indices for this word
      const gleamIndices = gleamMap.get(index) || new Set()

      // Draw each letter
      letters.forEach((letter, letterIndex) => {
        const letterWidth = letterWidths[letterIndex]

        // Check if this letter should have a light spot
        if (gleamIndices.has(letterIndex)) {
          // Save context for the light spot effect
          ctx.save()

          // Create a linear gradient for the reflection effect
          const gradientHeight = fontSize * 1.2
          const letterGradient = ctx.createLinearGradient(
            startX + letterWidth / 2,
            -gradientHeight / 2,
            startX + letterWidth / 2,
            gradientHeight / 2,
          )

          // Add gradient stops for an extremely subtle light reflection
          // Almost uniform color with just a hint of gradient
          letterGradient.addColorStop(0, "#4A4A4A") // Very slightly lighter top (was #555555)
          letterGradient.addColorStop(0.4, "#474747") // Almost the same as base color (was #4A4A4A)
          letterGradient.addColorStop(1, "#444444") // Base color at bottom

          ctx.fillStyle = letterGradient

          // Draw the letter with the gradient
          ctx.fillText(letter, startX + letterWidth / 2, 0)

          // Add a bright spot at the top of the letter - bigger but dimmer
          const spotX = startX + letterWidth * (0.3 + Math.random() * 0.4)
          const spotY = -fontSize * (0.2 + Math.random() * 0.2)
          // Increased spot size by 50%
          const spotSize = fontSize * (0.1 + Math.random() * 0.12) // Was (0.05 + Math.random() * 0.08)

          // Create a radial gradient for the bright spot - reduced opacity from 0.9 to 0.6
          const spot = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotSize)
          spot.addColorStop(0, "rgba(255, 255, 255, 0.6)") // Reduced opacity from 0.9 to 0.6
          spot.addColorStop(1, "rgba(255, 255, 255, 0)")

          ctx.fillStyle = spot
          ctx.beginPath()
          ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2)
          ctx.fill()

          ctx.restore()
        } else {
          // Draw regular letter
          ctx.fillText(letter, startX + letterWidth / 2, 0)
        }

        startX += letterWidth + letterSpacing // Move to next position with increased spacing
      })

      // Add a very subtle white outline to make text more legible without a background
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"
      ctx.lineWidth = 0.5

      // Reset position for stroke
      startX = -totalWidth / 2
      letters.forEach((letter, letterIndex) => {
        const letterWidth = letterWidths[letterIndex]
        ctx.strokeText(letter, startX + letterWidth / 2, 0)
        startX += letterWidth + letterSpacing
      })

      // Restore the context state
      ctx.restore()
    })

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    console.log("Canvas converted to data URL")
    return dataUrl
  } catch (error) {
    console.error("Error processing Liv Digital image:", error)
    throw error
  }
}
