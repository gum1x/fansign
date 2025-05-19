/**
 * Helper functions for working with the Telegram WebApp
 */

// Extract user ID from Telegram WebApp
export function getUserIdFromTelegram(): string | null {
  try {
    // @ts-ignore - Telegram object is injected by the Telegram WebApp
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      // @ts-ignore
      const twa = window.Telegram.WebApp

      // Try to get user ID from initDataUnsafe
      if (twa.initDataUnsafe && twa.initDataUnsafe.user) {
        const userId = twa.initDataUnsafe.user.id.toString()
        console.log("Got user ID from initDataUnsafe:", userId)
        return userId
      }

      // If that fails, try to parse initData
      if (twa.initData) {
        try {
          console.log("Trying to parse initData:", twa.initData)
          const params = new URLSearchParams(twa.initData)
          const userParam = params.get("user")

          if (userParam) {
            const user = JSON.parse(decodeURIComponent(userParam))
            if (user.id) {
              console.log("Got user ID from initData:", user.id)
              return user.id.toString()
            }
          }
        } catch (e) {
          console.error("Error parsing Telegram initData:", e)
        }
      }
    }

    // Fall back to URL parameter
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const urlUserId = urlParams.get("userId")
      if (urlUserId) {
        console.log("Got user ID from URL parameter:", urlUserId)
        return urlUserId
      }
    }

    // Fall back to localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      const storedUserId = localStorage.getItem("telegram_user_id")
      if (storedUserId) {
        console.log("Got user ID from localStorage:", storedUserId)
        return storedUserId
      }
    }

    console.log("Could not determine user ID")
    return null
  } catch (error) {
    console.error("Error getting user ID from Telegram:", error)
    return null
  }
}

// Initialize the Telegram WebApp
export function initTelegramWebApp(): boolean {
  try {
    // @ts-ignore - Telegram object is injected by the Telegram WebApp
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      // @ts-ignore
      const twa = window.Telegram.WebApp

      // Expand the WebApp to take full height
      twa.expand()

      // Notify Telegram that our app is ready
      twa.ready()

      // Log user info for debugging
      if (twa.initDataUnsafe && twa.initDataUnsafe.user) {
        console.log("Telegram user:", twa.initDataUnsafe.user)

        // Save user ID to localStorage for future use
        if (twa.initDataUnsafe.user.id && typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("telegram_user_id", twa.initDataUnsafe.user.id.toString())
        }
      }

      return true
    }
    return false
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)
    return false
  }
}

// Check if running inside Telegram WebApp
export function isTelegramWebApp(): boolean {
  // @ts-ignore - Telegram object is injected by the Telegram WebApp
  return typeof window !== "undefined" && !!window.Telegram && !!window.Telegram.WebApp
}

// Get Telegram WebApp theme
export function getTelegramTheme(): "light" | "dark" {
  try {
    // @ts-ignore - Telegram object is injected by the Telegram WebApp
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      // @ts-ignore
      const twa = window.Telegram.WebApp

      // Check if color scheme is available
      if (twa.colorScheme) {
        return twa.colorScheme as "light" | "dark"
      }
    }
    return "dark" // Default to dark theme
  } catch (error) {
    console.error("Error getting Telegram theme:", error)
    return "dark" // Default to dark theme on error
  }
}
