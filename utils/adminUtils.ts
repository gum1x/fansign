export function getAdminUserId(): string {
  return "7314936460" // Hardcoded admin ID for security
}

export function isAdmin(userId: string): boolean {
  // In preview environments, allow more flexibility
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    (typeof window !== "undefined" && window.location.hostname.includes("vercel.app"))
  ) {
    // In preview, also accept these test IDs
    const previewAdminIds = ["7314936460", "preview_user", "admin"]
    return previewAdminIds.includes(userId) || userId?.startsWith("preview_user_")
  }

  // In production, only the specific admin ID is allowed
  return userId === getAdminUserId()
}

export function isAdminUser(userId: string): boolean {
  return isAdmin(userId)
}
