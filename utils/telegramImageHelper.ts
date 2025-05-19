/**
 * Formats an image for Telegram by optimizing its size and quality
 * @param dataUrl The image data URL to optimize
 * @returns A promise that resolves to the optimized image data URL
 */
export async function formatImageForTelegram(dataUrl: string): Promise<string> {
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl)
    const blob = await response.blob()

    // Check if the image is already small enough (under 1MB)
    if (blob.size < 1024 * 1024) {
      return dataUrl
    }

    // Create a new canvas for resizing
    const img = new Image()
    img.src = dataUrl
    await new Promise((resolve) => {
      img.onload = resolve
    })

    // Progressive compression strategy
    let quality = 0.9
    let maxDimension = 1500
    let optimizedDataUrl = await resizeAndCompressImage(img, maxDimension, quality)

    // Check if we need further compression
    let optimizedBlob = await (await fetch(optimizedDataUrl)).blob()

    // If still too large, compress more aggressively
    if (optimizedBlob.size > 800 * 1024) {
      quality = 0.7
      maxDimension = 1200
      optimizedDataUrl = await resizeAndCompressImage(img, maxDimension, quality)

      optimizedBlob = await (await fetch(optimizedDataUrl)).blob()

      // If still too large, compress even more
      if (optimizedBlob.size > 500 * 1024) {
        quality = 0.5
        maxDimension = 1000
        optimizedDataUrl = await resizeAndCompressImage(img, maxDimension, quality)
      }
    }

    return optimizedDataUrl
  } catch (error) {
    console.error("Error formatting image for Telegram:", error)
    return dataUrl // Return original if optimization fails
  }
}

/**
 * Resizes and compresses an image
 * @param img The image element to resize and compress
 * @param maxDimension The maximum width or height of the image
 * @param quality The quality of the compressed image (0-1)
 * @returns A promise that resolves to the resized and compressed image data URL
 */
async function resizeAndCompressImage(img: HTMLImageElement, maxDimension: number, quality: number): Promise<string> {
  // Create a canvas with reduced dimensions
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  // Calculate new dimensions
  let width = img.width
  let height = img.height

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width)
      width = maxDimension
    } else {
      width = Math.round((width * maxDimension) / height)
      height = maxDimension
    }
  }

  canvas.width = width
  canvas.height = height
  ctx.drawImage(img, 0, 0, width, height)

  // Get compressed image data
  return canvas.toDataURL("image/jpeg", quality)
}
