/**
 * Scribe Text Renderer
 * Adapted from https://github.com/greydanus/scribe
 *
 * This utility provides handwriting-like text rendering based on the scribe approach
 */
import { getCompleteCharacterPath } from "./completeCharacterSet"

// Parameters for controlling the handwriting style
interface ScribeParams {
  // Base parameters
  jitter: number // How much the pen jitters (0-1)
  lineWidth: number // Width of the pen stroke (1-10)
  inkAmount: number // How much ink is used (0-1)

  // Character parameters
  charSpacing: number // Space between characters (0.5-2)
  charJitter: number // Random variation in character placement (0-1)

  // Style parameters
  slant: number // Slant angle in radians (-0.5 to 0.5)
  curveNoise: number // How much the curves vary (0-1)

  // Pressure parameters
  pressure: number // Base pressure (0-1)
  pressureVariation: number // How much pressure varies (0-1)
}

// Default parameters for different styles
const STYLE_PRESETS = {
  handwritten: {
    jitter: 0.3,
    lineWidth: 2.5,
    inkAmount: 0.8,
    charSpacing: 0.9,
    charJitter: 0.4,
    slant: 0.12,
    curveNoise: 0.4,
    pressure: 0.7,
    pressureVariation: 0.3,
  },
  cursive: {
    jitter: 0.2,
    lineWidth: 2.0,
    inkAmount: 0.7,
    charSpacing: 1.1,
    charJitter: 0.3,
    slant: 0.25,
    curveNoise: 0.5,
    pressure: 0.6,
    pressureVariation: 0.4,
  },
  messy: {
    jitter: 0.5,
    lineWidth: 3.0,
    inkAmount: 0.9,
    charSpacing: 0.8,
    charJitter: 0.6,
    slant: 0.1,
    curveNoise: 0.7,
    pressure: 0.8,
    pressureVariation: 0.5,
  },
  neat: {
    jitter: 0.1,
    lineWidth: 2.2,
    inkAmount: 0.75,
    charSpacing: 1.0,
    charJitter: 0.2,
    slant: 0.15,
    curveNoise: 0.2,
    pressure: 0.7,
    pressureVariation: 0.2,
  },
}

// Helper function to generate a random number within a range
function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

// Helper function to add noise to a value based on jitter
function addNoise(value: number, jitter: number): number {
  return value + (Math.random() - 0.5) * jitter
}

// Helper function to interpolate between points with Catmull-Rom spline
function catmullRomInterpolate(
  p0: [number, number, number],
  p1: [number, number, number],
  p2: [number, number, number],
  p3: [number, number, number],
  t: number,
): [number, number, number] {
  const t2 = t * t
  const t3 = t2 * t

  // Catmull-Rom coefficients
  const a = -0.5 * p0[0] + 1.5 * p1[0] - 1.5 * p2[0] + 0.5 * p3[0]
  const b = p0[0] - 2.5 * p1[0] + 2 * p2[0] - 0.5 * p3[0]
  const c = -0.5 * p0[0] + 0.5 * p2[0]
  const d = p1[0]

  const e = -0.5 * p0[1] + 1.5 * p1[1] - 1.5 * p2[1] + 0.5 * p3[1]
  const f = p0[1] - 2.5 * p1[1] + 2 * p2[1] - 0.5 * p3[1]
  const g = -0.5 * p0[1] + 0.5 * p2[1]
  const h = p1[1]

  const i = -0.5 * p0[2] + 1.5 * p1[2] - 1.5 * p2[2] + 0.5 * p3[2]
  const j = p0[2] - 2.5 * p1[2] + 2 * p2[2] - 0.5 * p3[2]
  const k = -0.5 * p0[2] + 0.5 * p2[2]
  const l = p1[2]

  const x = a * t3 + b * t2 + c * t + d
  const y = e * t3 + f * t2 + g * t + h
  const pressure = i * t3 + j * t2 + k * t + l

  return [x, y, pressure]
}

// Function to render text with handwriting effect
export function renderHandwrittenText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  stylePreset: keyof typeof STYLE_PRESETS = "handwritten",
  color = "rgba(0, 0, 0, 0.8)",
  customParams?: Partial<ScribeParams>,
): void {
  // Get style parameters
  const params: ScribeParams = {
    ...STYLE_PRESETS[stylePreset],
    ...customParams,
  }

  // Calculate character size based on available width and text length
  const charWidth = width / (text.length * params.charSpacing)
  const charHeight = height * 0.8 // Leave some margin

  // Set up context
  ctx.save()

  // Apply overall slant to the text
  ctx.translate(x, y)
  ctx.transform(1, params.slant, 0, 1, 0, 0)

  // Current position
  let currentX = 0

  // Render each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase() // Convert to uppercase for simplicity

    // Add random variation to character position
    const charX = currentX + addNoise(0, params.charJitter * charWidth)
    const charY = addNoise(0, params.charJitter * charHeight)

    // Draw the character
    drawCharacter(ctx, char, charX, charY, charWidth, charHeight, params, color)

    // Move to next character position
    currentX += charWidth * params.charSpacing
  }

  // Restore context
  ctx.restore()
}

// Function to draw a single character
function drawCharacter(
  ctx: CanvasRenderingContext2D,
  char: string,
  x: number,
  y: number,
  width: number,
  height: number,
  params: ScribeParams,
  color: string,
): void {
  // Get character path data using our complete character set
  const pathData = getCompleteCharacterPath(char)

  if (!pathData || pathData.length === 0) {
    // If no path data, draw a simple line for unknown characters
    ctx.beginPath()
    ctx.moveTo(x, y + height * 0.5)
    ctx.lineTo(x + width, y + height * 0.5)
    ctx.stroke()
    return
  }

  // Draw each stroke in the character
  for (const stroke of pathData) {
    drawStroke(ctx, stroke, x, y, width, height, params, color)
  }
}

// Function to draw a single stroke
function drawStroke(
  ctx: CanvasRenderingContext2D,
  points: [number, number, number][],
  x: number,
  y: number,
  width: number,
  height: number,
  params: ScribeParams,
  color: string,
): void {
  if (points.length < 2) return

  // Add control points at the beginning and end for smooth curves
  const controlPoints = [points[0], ...points, points[points.length - 1]]

  // Create a path with many small segments for natural look
  const segments = Math.max(points.length * 10, 20)

  ctx.beginPath()

  // Start at the first point
  const startPoint = controlPoints[1]
  ctx.moveTo(x + startPoint[0] * width, y + startPoint[1] * height)

  // Draw the stroke with many small segments
  for (let i = 1; i < segments; i++) {
    const t = i / segments
    const segmentIndex = Math.floor(t * (controlPoints.length - 3)) + 1
    const segmentT = (t * (controlPoints.length - 3)) % 1

    const p0 = controlPoints[segmentIndex - 1]
    const p1 = controlPoints[segmentIndex]
    const p2 = controlPoints[segmentIndex + 1]
    const p3 = controlPoints[segmentIndex + 2]

    // Interpolate between points
    const [px, py, pressure] = catmullRomInterpolate(p0, p1, p2, p3, segmentT)

    // Add noise to the point based on jitter
    const noisyX = x + addNoise(px * width, params.jitter * width * 0.05)
    const noisyY = y + addNoise(py * height, params.jitter * height * 0.05)

    // Calculate line width based on pressure
    const basePressure = params.pressure + (pressure - 0.5) * params.pressureVariation
    const lineWidth = params.lineWidth * (0.5 + basePressure * 0.5)

    // Calculate opacity based on ink amount
    const opacity = Math.min(1, params.inkAmount * (0.7 + pressure * 0.3))

    // Set line style
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = color.replace("rgba(", "").replace(")", "").split(",").slice(0, 3).join(",") + `,${opacity})`

    // Draw line to this point
    ctx.lineTo(noisyX, noisyY)
  }

  // Stroke the path
  ctx.stroke()
}

// Main function to render text on a canvas with handwriting effect
export function renderScribeText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    style?: keyof typeof STYLE_PRESETS
    color?: string
    fontSize?: number
    lineHeight?: number
    maxWidth?: number
    align?: "left" | "center" | "right"
    customParams?: Partial<ScribeParams>
  } = {},
): void {
  const {
    style = "handwritten",
    color = "rgba(0, 0, 0, 0.8)",
    fontSize = 24,
    lineHeight = 1.5,
    maxWidth = width,
    align = "left",
    customParams,
  } = options

  // First, handle explicit line breaks
  const lines = text.split("\n")
  let currentY = y

  // Process each line separately
  for (const line of lines) {
    // Split line into words
    const words = line.split(" ")

    // Current position for this line
    let currentX = x
    let lineWidth = 0
    let currentLine = ""

    // Process each word in the line
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const wordWidth = fontSize * word.length * 0.6 // Approximate word width

      // Check if adding this word would exceed the maximum width
      if (currentX + wordWidth > x + maxWidth && currentLine !== "") {
        // Render the current line
        const lineX =
          align === "center" ? x + (maxWidth - lineWidth) / 2 : align === "right" ? x + maxWidth - lineWidth : x

        renderHandwrittenText(ctx, currentLine, lineX, currentY, lineWidth, fontSize, style, color, customParams)

        // Move to the next line
        currentLine = ""
        lineWidth = 0
        currentX = x
        currentY += fontSize * lineHeight
      }

      // Add the word to the current line
      if (currentLine !== "") {
        currentLine += " "
        lineWidth += fontSize * 0.4 // Space width
      }

      currentLine += word
      lineWidth += wordWidth
      currentX += wordWidth + fontSize * 0.4 // Word width + space
    }

    // Render the last line of this paragraph
    if (currentLine !== "") {
      const lineX =
        align === "center" ? x + (maxWidth - lineWidth) / 2 : align === "right" ? x + maxWidth - lineWidth : x

      renderHandwrittenText(ctx, currentLine, lineX, currentY, lineWidth, fontSize, style, color, customParams)
    }

    // Move to the next line for the next paragraph
    currentY += fontSize * lineHeight * 1.2 // Add extra space between paragraphs
  }
}

// Export the style presets for external use
export { STYLE_PRESETS }
