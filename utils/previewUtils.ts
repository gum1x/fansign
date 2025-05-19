"use client"

export function isPreviewEnvironment(): boolean {
  if (typeof window === "undefined") return false

  return process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || window.location.hostname.includes("vercel.app")
}

export function getPreviewUserId(): string {
  return "preview_user_" + Math.floor(Math.random() * 1000000)
}
