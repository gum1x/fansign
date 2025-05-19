import type React from "react"
export async function processSignImage(requestText: string, canvasRef: React.RefObject<HTMLCanvasElement>) {
  if (!requestText.trim()) return false

  try {
    // Load the image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1047.JPG-eUk9CLgdVSnDP6Q2CWWt0ahox0GZEn.jpeg" // Empty sign image

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
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

    // Fixed values
    const textColor = "#111111" // Darker text color
    const fontSize = 40 // Fixed optimal font size
    const letterSpacing = 3 // Fixed letter spacing
    const glowIntensity = 40 // Fixed glow intensity
    const outlineWidth = 2 // Fixed outline width

    // Define the sign structure based on the reference image
    const signStructure = {
      grid: {
        // Define the exact boundaries of the light blue area - moved higher
        y: img.height * 0.35, // Start position moved higher
        height: img.height * 0.25, // Height reduced for tighter spacing
        // Define the horizontal boundaries to ensure text stays within white area
        x: img.width * 0.1, // 10% from left edge
        width: img.width * 0.8, // 80% of image width
        textColor: textColor,
        fontSize: fontSize,
        // Define the three horizontal sections with extremely tight spacing
        // Keep the middle word position and move first and last words much closer to it
        sections: [
          { y: img.height * 0.435, height: img.height * 0.07 }, // Top section - moved much closer to middle
          { y: img.height * 0.46, height: img.height * 0.07 }, // Middle section - kept at same position
          { y: img.height * 0.485, height: img.height * 0.07 }, // Bottom section - moved much closer to middle
        ],
      },
    }

    // Prepare text for the grid sections
    let gridWords = []
    const words = requestText.split(" ")

    if (words.length <= 3) {
      // If 3 or fewer words, each word gets its own row
      gridWords = words.map((word) => word.toUpperCase())
      // Pad with empty strings if less than 3 words
      while (gridWords.length < 3) {
        gridWords.push("")
      }
    } else {
      // If more than 3 words, distribute them across 3 rows
      const wordsPerRow = Math.ceil(words.length / 3)
      for (let i = 0; i < 3; i++) {
        const rowWords = words.slice(i * wordsPerRow, (i + 1) * wordsPerRow)
        gridWords.push(rowWords.join(" ").toUpperCase())
      }
    }

    // Draw each word in its designated section
    for (let i = 0; i < signStructure.grid.sections.length; i++) {
      const section = signStructure.grid.sections[i]
      const word = gridWords[i]

      if (!word) continue // Skip empty sections

      // Set font for grid text
      ctx.font = `bold ${signStructure.grid.fontSize}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Calculate the center of the section
      const sectionCenterY = section.y + section.height / 2

      // Draw the word in the center of its section
      const letters = word.split("")

      // Calculate letter widths and total width
      let wordWidth = 0
      const letterWidths = []

      // First pass: measure each letter
      for (const letter of letters) {
        if (letter.trim() === "") {
          // Handle spaces
          const spaceWidth = ctx.measureText(" ").width
          letterWidths.push(spaceWidth)
          wordWidth += spaceWidth
        } else {
          const width = ctx.measureText(letter).width
          letterWidths.push(width)
          wordWidth += width
        }
      }

      // Calculate total width with spacing
      // Only add spacing between letters, not after the last letter
      const totalWidth = wordWidth + (letters.length - 1) * letterSpacing

      // Ensure text stays within the horizontal boundaries
      const maxWidth = signStructure.grid.width
      if (totalWidth > maxWidth) {
        // Scale down font size to fit if needed
        const scaleFactor = maxWidth / totalWidth
        const adjustedFontSize = Math.floor(signStructure.grid.fontSize * scaleFactor)
        ctx.font = `bold ${adjustedFontSize}px Arial`

        // Recalculate letter widths with new font size
        wordWidth = 0
        for (let j = 0; j < letters.length; j++) {
          if (letters[j].trim() === "") {
            // Handle spaces
            const spaceWidth = ctx.measureText(" ").width
            letterWidths[j] = spaceWidth
            wordWidth += spaceWidth
          } else {
            const width = ctx.measureText(letters[j]).width
            letterWidths[j] = width
          }
        }
      }

      // Recalculate total width after potential font adjustment
      const finalTotalWidth = wordWidth + (letters.length - 1) * letterSpacing

      // Ensure there's at least 1px margin on each side and text doesn't go too far left/right
      const leftBoundary = signStructure.grid.x
      const rightBoundary = signStructure.grid.x + signStructure.grid.width

      // Center the text
      let currentX = (img.width - finalTotalWidth) / 2

      // Add a larger offset to move text more to the right
      currentX += 35 // 35px offset to the right

      // If text is too wide, scale it down more aggressively
      if (finalTotalWidth > maxWidth * 0.95) {
        // Scale down font size more to ensure text fits well within boundaries
        const scaleFactor = (maxWidth * 0.95) / finalTotalWidth
        const newFontSize = Math.floor(signStructure.grid.fontSize * scaleFactor)
        ctx.font = `bold ${newFontSize}px Arial`

        // Recalculate with new font size
        wordWidth = 0
        for (let j = 0; j < letters.length; j++) {
          if (letters[j].trim() === "") {
            // Handle spaces
            const spaceWidth = ctx.measureText(" ").width
            letterWidths[j] = spaceWidth
            wordWidth += spaceWidth
          } else {
            const width = ctx.measureText(letters[j]).width
            letterWidths[j] = width
          }
        }

        const recalculatedTotalWidth = wordWidth + (letters.length - 1) * letterSpacing
        currentX = (img.width - recalculatedTotalWidth) / 2 + 35 // Add the 35px offset
      }

      // Final boundary check with margins
      if (currentX < leftBoundary) {
        currentX = leftBoundary + 2 // Add 2px margin
      }
      if (currentX + finalTotalWidth > rightBoundary) {
        currentX = rightBoundary - finalTotalWidth - 2 // Add 2px margin
      }

      // Draw each letter with its box
      for (let j = 0; j < letters.length; j++) {
        const letter = letters[j]
        const letterWidth = letterWidths[j]

        if (letter.trim() === "") {
          // Handle spaces - just move the cursor
          currentX += letterWidth + letterSpacing
          continue
        }

        const letterHeight = signStructure.grid.fontSize * 0.8

        // Draw letter box outline - stretched much taller upwards and made even lighter
        const padding = 4
        const extraHeightTop = 16 // Significantly more height at the top
        const extraHeightBottom = 2 // Small extra height at the bottom
        ctx.strokeStyle = "rgba(150, 150, 150, 0.15)" // Even lighter outline (reduced opacity from 0.2 to 0.15)
        ctx.lineWidth = outlineWidth

        // Save the current context state
        ctx.save()

        // Apply a slightly increased rotation (3 degrees) for a more noticeable tilt to the right
        const rotationAngle = (3 * Math.PI) / 180 // 3 degrees in radians

        // Move to the center of the letter box, rotate, then draw
        ctx.translate(currentX + letterWidth / 2, sectionCenterY)
        ctx.rotate(rotationAngle)

        // Draw the box outline with rotation applied
        ctx.strokeRect(
          -letterWidth / 2 - padding / 2,
          -letterHeight / 2 - padding / 2 - extraHeightTop, // Shifted up significantly
          letterWidth + padding,
          letterHeight + padding + extraHeightTop + extraHeightBottom, // Added extra height, mostly at the top
        )

        // Restore the context to remove rotation for the next operations
        ctx.restore()

        // Create glow effect
        const glowRadius = letterWidth * 0.6
        const glow = ctx.createRadialGradient(
          currentX + letterWidth / 2,
          sectionCenterY - 1,
          0,
          currentX + letterWidth / 2,
          sectionCenterY - 1,
          glowRadius,
        )
        glow.addColorStop(0, `rgba(255, 255, 255, ${glowIntensity / 100})`)
        glow.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(currentX + letterWidth / 2, sectionCenterY - 1, glowRadius, 0, Math.PI * 2)

        ctx.fill()

        // Save context again for text rotation and vertical stretching
        ctx.save()

        // Apply the same rotation for the text
        ctx.translate(currentX + letterWidth / 2, sectionCenterY - 1)
        ctx.rotate(rotationAngle)

        // Apply vertical stretching (increase height by 15% without changing width)
        ctx.scale(1, 1.4)

        // Add letter flaws/texture with more variation
        const flawIntensity = 0.4 // Increased from 0.3 for more noticeable flaws

        // Random size variation for some letters (±5%)
        const sizeVariation = 0.95 + Math.random() * 0.1
        ctx.scale(sizeVariation, sizeVariation)

        // Create a gradient for 3D effect
        const gradientHeight = letterHeight * 1.2
        const letterGradient = ctx.createLinearGradient(0, -gradientHeight / 2, 0, gradientHeight / 2)

        // Add slight random variations to opacity
        const opacityVariation = 0.85 + Math.random() * 0.3
        const opacity = Math.floor(153 * opacityVariation).toString(16)

        // With these lines that have much more subtle differences:
        letterGradient.addColorStop(0, "#181818" + opacity) // Very slightly lighter at top
        letterGradient.addColorStop(0.4, "#161616" + opacity) // Middle
        letterGradient.addColorStop(1, "#141414" + opacity) // Very slightly darker at bottom

        ctx.fillStyle = letterGradient
        // Add slight random variations to letter position
        const offsetX = (Math.random() - 0.5) * 2 * flawIntensity
        const offsetY = (Math.random() - 0.5) * 2 * flawIntensity

        // Draw the letter with variations
        ctx.fillText(letter, offsetX, offsetY) // Draw with slight random offset

        // Restore the context after drawing the main letter
        ctx.restore()

        // Add a gleaming spot to random letters (1 in 4 chance)
        if (Math.random() < 0.25) {
          ctx.save()

          // Position for the gleam (usually top-right of the letter)
          const gleamX = currentX + letterWidth * (0.6 + Math.random() * 0.2)
          const gleamY = sectionCenterY - letterHeight * (0.3 + Math.random() * 0.2)
          const gleamSize = letterWidth * (0.1 + Math.random() * 0.1)

          // Create a small radial gradient for the gleam
          const gleam = ctx.createRadialGradient(gleamX, gleamY, 0, gleamX, gleamY, gleamSize)
          gleam.addColorStop(0, "rgba(255, 255, 255, 0.8)")
          gleam.addColorStop(1, "rgba(255, 255, 255, 0)")

          ctx.fillStyle = gleam
          ctx.beginPath()
          ctx.arc(gleamX, gleamY, gleamSize, 0, Math.PI * 2)
          ctx.fill()

          ctx.restore()
        }

        // Move to next letter position
        currentX += letterWidth + letterSpacing
      }
    }

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    return dataUrl
  } catch (error) {
    console.error("Error processing sign image:", error)
    throw error
  }
}

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

    // Define the text parameters
    const text = requestText.toUpperCase()
    const fontSize = Math.min(80, 800 / text.length) // Reduced size by 20% and adjusted scaling
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    console.log("Text parameters set:", text, "fontSize:", fontSize)

    // Define the position (center of the white banner)
    const textX = img.width / 2
    const textY = img.height / 2 + 20 // Slightly below center for better positioning on the banner
    console.log("Text position:", textX, textY)

    // Add black fill only (no outline)
    ctx.fillStyle = "black"
    ctx.fillText(text, textX, textY)
    console.log("Text rendered to canvas")

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    console.log("Canvas converted to data URL")
    return dataUrl
  } catch (error) {
    console.error("Error processing bophouse image:", error)
    throw error
  }
}
