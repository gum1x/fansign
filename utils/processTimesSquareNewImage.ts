import type React from "react"

export async function processTimesSquareNewImage(
  uploadedImage: string | null,
  uploadedSecondImage: string | null,
  canvasRef: React.RefObject<HTMLCanvasElement>,
) {
  try {
    console.log("Starting Times Square New image processing")

    // Check canvas reference early
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas reference is not available in processTimesSquareNewImage")
      throw new Error("Canvas reference is not available")
    }

    // Load the background image
    const bgImg = new Image()
    bgImg.crossOrigin = "anonymous"
    bgImg.src = "/images/times-square-billboard-new.jpeg"

    console.log("Loading new Times Square image from:", bgImg.src)

    // Wait for the image to load with explicit promise handling
    await new Promise((resolve, reject) => {
      bgImg.onload = () => {
        console.log("New Times Square image loaded successfully, dimensions:", bgImg.width, "x", bgImg.height)
        resolve(null)
      }
      bgImg.onerror = (e) => {
        console.error("Failed to load new Times Square image:", e)
        reject(new Error("Failed to load new Times Square image"))
      }
    })

    // Set up canvas - we already checked it exists above
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get canvas 2D context")
      throw new Error("Could not get canvas 2D context")
    }

    // Set canvas dimensions
    canvas.width = bgImg.width
    canvas.height = bgImg.height
    console.log("Canvas dimensions set to:", canvas.width, "x", canvas.height)

    // Clear the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the background image
    ctx.drawImage(bgImg, 0, 0)
    console.log("Background image drawn to canvas")

    // If the first image was uploaded, place it on the first billboard area
    if (uploadedImage) {
      console.log("Processing first uploaded image")
      const userImg = new Image()
      userImg.crossOrigin = "anonymous"
      userImg.src = uploadedImage

      await new Promise((resolve, reject) => {
        userImg.onload = () => {
          console.log("First user image loaded successfully, dimensions:", userImg.width, "x", userImg.height)
          resolve(null)
        }
        userImg.onerror = (e) => {
          console.error("Failed to load first user image:", e)
          reject(new Error("Failed to load first user image"))
        }
      })

      // Define the first billboard area coordinates and dimensions as specified
      const billboard1X = 358 // 358px from left edge
      const billboard1Y = 73 // 73px from top edge
      const billboard1Width = 286 // 286px wide
      const billboard1Height = 84 // 84px tall

      // Draw the user's first image onto the first billboard area
      ctx.drawImage(userImg, billboard1X, billboard1Y, billboard1Width, billboard1Height)
      console.log("First image drawn to canvas at position:", billboard1X, billboard1Y)
    }

    // If the second image was uploaded, place it on the second billboard area
    if (uploadedSecondImage) {
      console.log("Processing second uploaded image")
      const userImg2 = new Image()
      userImg2.crossOrigin = "anonymous"
      userImg2.src = uploadedSecondImage

      await new Promise((resolve, reject) => {
        userImg2.onload = () => {
          console.log("Second user image loaded successfully, dimensions:", userImg2.width, "x", userImg2.height)
          resolve(null)
        }
        userImg2.onerror = (e) => {
          console.error("Failed to load second user image:", e)
          reject(new Error("Failed to load second user image"))
        }
      })

      // Define the second billboard area coordinates and dimensions as specified
      const billboard2X = 288 // 288px from left edge
      const billboard2Y = 180 // 180px from top edge
      const billboard2Width = 378 // 378px wide
      const billboard2Height = 113 // 113px tall

      // Draw the user's second image onto the second billboard area
      ctx.drawImage(userImg2, billboard2X, billboard2Y, billboard2Width, billboard2Height)
      console.log("Second image drawn to canvas at position:", billboard2X, billboard2Y)
    }

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    console.log("Image processing complete, returning data URL")
    return dataUrl
  } catch (error) {
    console.error("Error processing new Times Square image:", error)
    throw error
  }
}
