import type React from "react"

export async function processPoppyImage(requestText: string, canvasRef: React.RefObject<HTMLCanvasElement>) {
  if (!requestText.trim()) return false

  try {
    // Load the image with explicit error handling
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Use the direct URL to the Poppy image with a timestamp to prevent caching issues
    img.src = `/images/poppy-template.jpeg?t=${Date.now()}`

    console.log("Loading Poppy image from:", img.src)

    // Add a fallback mechanism in case the image fails to load
    let imageLoaded = false

    // Wait for the image to load with explicit error handling and timeout
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        img.onload = () => {
          console.log("Poppy image loaded successfully, dimensions:", img.width, "x", img.height)
          imageLoaded = true
          resolve()
        }
        img.onerror = (e) => {
          console.error("Failed to load Poppy image:", e)
          console.error("Image URL attempted:", img.src)
          // Try an alternative path
          img.src = `/poppy-template.jpeg?t=${Date.now()}`
          console.log("Trying alternative path:", img.src)

          // Set a second onload/onerror for the alternative path
          img.onload = () => {
            console.log("Poppy image loaded from alternative path")
            imageLoaded = true
            resolve()
          }
          img.onerror = () => {
            reject(new Error(`Failed to load Poppy image from both paths`))
          }
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Image load timeout after 10 seconds")), 10000)),
    ])

    // If image failed to load, create a blank canvas with the Poppy text
    if (!imageLoaded) {
      console.log("Using fallback blank canvas for Poppy sign")
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

      // Fill with white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add colorful border to simulate the Poppy sign
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#ff0099")
      gradient.addColorStop(0.5, "#ff0000")
      gradient.addColorStop(1, "#ff0099")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 20
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

      // Add "POPPY" text at the top
      ctx.font = "bold 80px Arial"
      ctx.textAlign = "center"
      ctx.fillStyle = "#000000" // Black text
      ctx.fillText("POPPY", canvas.width / 2, 80)

      // Add the user's text
      ctx.font = "bold 60px Arial"
      ctx.fillText(requestText, canvas.width / 2, canvas.height / 2)

      // Return the fallback image
      return canvas.toDataURL("image/jpeg", 0.9)
    }

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

    // Add a red tint to differentiate it as the Poppy version
    ctx.fillStyle = "rgba(255, 0, 0, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Fixed values
    const textColor = "#111111" // Darker text color
    const fontSize = 40 // Fixed optimal font size
    const letterSpacing = 3 // Fixed letter spacing
    const glowIntensity = 40 // Fixed glow intensity
    const outlineWidth = 2 // Fixed outline width

    // Calculate the center position based on the specified measurement (554px from the right edge)
    // We need to scale this value if the image dimensions are different
    const rightEdgeDistance = 554
    const scaleX = img.width / 1179 // Assuming 1179 is the reference width
    const centerX = img.width - rightEdgeDistance * scaleX

    // Define the sign structure based on the reference image
    const signStructure = {
      grid: {
        // Define the exact boundaries of the light blue area - moved higher
        y: img.height * 0.35, // Start position moved higher
        height: img.height * 0.25, // Height reduced for tighter spacing
        // Define the horizontal boundaries to ensure text stays within white area
        x: img.width * 0.1, // 10% from left edge
        width: img.width * 0.8, // 80% of image width
        textColor: textColor, // Use black text color
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

    // Collect all letter positions for gleam selection
    const allLetterPositions = []

    // First pass to collect all letter positions
    gridWords.forEach((word, wordIndex) => {
      if (!word) return // Skip empty words

      const letters = word.split("")
      letters.forEach((letter, letterIndex) => {
        if (letter.trim() !== "") {
          allLetterPositions.push({ wordIndex, letterIndex })
        }
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

      // Calculate the starting X position to center the text at the specified point
      let currentX = centerX - finalTotalWidth / 2

      // Ensure there's at least 1px margin on each side and text doesn't go too far left/right
      const leftBoundary = signStructure.grid.x
      const rightBoundary = signStructure.grid.x + signStructure.grid.width

      // Final boundary check with margins
      if (currentX < leftBoundary) {
        currentX = leftBoundary + 2 // Add 2px margin
      }
      if (currentX + finalTotalWidth > rightBoundary) {
        currentX = rightBoundary - finalTotalWidth - 2 // Add 2px margin
      }

      // Get the gleam indices for this word
      const gleamIndices = gleamMap.get(i) || new Set()

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

        // Use black text with subtle gradient for 3D effect
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

        // Add a gleaming spot only to specifically selected letters
        if (gleamIndices.has(j)) {
          ctx.save()

          // Position for the gleam (usually top-right of the letter)
          const gleamX = currentX + letterWidth * (0.6 + Math.random() * 0.2)
          const gleamY = sectionCenterY - letterHeight * (0.3 + Math.random() * 0.2)
          const gleamSize = letterWidth * (0.1 + Math.random() * 0.1)

          // Create a small radial gradient for the gleam
          const gleam = ctx.createRadialGradient(gleamX, gleamY, 0, gleamX, gleamY, gleamSize)
          gleam.addColorStop(0, "rgba(255, 255, 255, 0.9)")
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
    console.error("Error processing Poppy image:", error)
    throw error
  }
}
