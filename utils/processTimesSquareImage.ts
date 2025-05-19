import type React from "react"

export async function processTimesSquareImage(
  uploadedImage: string | null,
  canvasRef: React.RefObject<HTMLCanvasElement>,
) {
  try {
    // Load the background image
    const bgImg = new Image()
    bgImg.crossOrigin = "anonymous"
    bgImg.src = "/images/times-square-billboard.jpeg"

    console.log("Loading Times Square image from:", bgImg.src)

    // Wait for the image to load with explicit promise handling
    await new Promise((resolve, reject) => {
      bgImg.onload = () => {
        console.log("Times Square image loaded successfully, dimensions:", bgImg.width, "x", bgImg.height)
        resolve(null)
      }
      bgImg.onerror = (e) => {
        console.error("Failed to load Times Square image:", e)
        reject(new Error("Failed to load Times Square image"))
      }
    })

    // Set up canvas
    const canvas = canvasRef.current
    if (!canvas) {
      throw new Error("Canvas reference is not available")
    }

    canvas.width = bgImg.width
    canvas.height = bgImg.height
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get canvas 2D context")
    }

    // Draw the background image
    ctx.drawImage(bgImg, 0, 0)

    // If an image was uploaded, place it on the billboard
    if (uploadedImage) {
      const userImg = new Image()
      userImg.crossOrigin = "anonymous"
      userImg.src = uploadedImage

      await new Promise((resolve, reject) => {
        userImg.onload = () => {
          console.log("User image loaded successfully, dimensions:", userImg.width, "x", userImg.height)
          resolve(null)
        }
        userImg.onerror = (e) => {
          console.error("Failed to load user image:", e)
          reject(new Error("Failed to load user image"))
        }
      })

      // Define the billboard area coordinates and dimensions
      const billboardX = 363 // 367px from left edge
      const billboardY = 116 // 122px from top edge
      const billboardWidth = 176 // 174px wide
      const billboardHeight = 157 // 157px tall

      // Draw the user's image onto the billboard area
      ctx.drawImage(userImg, billboardX, billboardY, billboardWidth, billboardHeight)
    }

    // Get the processed image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    return dataUrl
  } catch (error) {
    console.error("Error processing Times Square image:", error)
    throw error
  }
}
