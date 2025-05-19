"use client"

import { useState, useEffect } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SupportChat } from "@/components/support-chat"
import { checkUnreadMessages } from "@/app/actions/supportActions"
// Import isAdmin utility
import { isAdmin } from "@/utils/adminUtils"

interface SupportButtonProps {
  userId: string
  onClose?: () => void
}

// Update the SupportButton component to check if user is admin
export function SupportButton({ userId, onClose }: SupportButtonProps) {
  // Make sure the isOpen state is definitely set to false initially
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isUserAdmin, setIsUserAdmin] = useState(false)

  // Check if user is admin on component mount
  useEffect(() => {
    setIsUserAdmin(isAdmin(userId))
  }, [userId])

  // Check for unread messages on load and periodically
  useEffect(() => {
    // Only check for unread messages for non-admin users
    if (!userId || isUserAdmin) return

    const checkMessages = async () => {
      const result = await checkUnreadMessages(userId)
      if (result.success) {
        setHasUnread(result.hasUnread)
        setUnreadCount(result.count || 0)
      }
    }

    checkMessages()

    // Check every 30 seconds for new messages
    const interval = setInterval(checkMessages, 30000)
    return () => clearInterval(interval)
  }, [userId, isUserAdmin])

  // If user is admin, don't show the regular support button
  if (isUserAdmin) {
    return null
  }

  // Ensure the close button properly exits the support chat
  // Update the handleClose function to be more explicit
  const handleClose = () => {
    setIsOpen(false)
    // If there's an onClose callback from parent, call it
    if (onClose) onClose()
  }

  return (
    <>
      {/* Only show the button initially */}
      <div className="fixed right-4 bottom-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-10 h-10 bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950 shadow-lg p-0 flex items-center justify-center"
          aria-label="Support"
        >
          <MessageCircle className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Only render the chat dialog when isOpen is true */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-gray-900 w-full sm:rounded-lg sm:w-[95%] sm:max-w-md h-[85vh] sm:h-[600px] overflow-hidden border border-purple-700/50 animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between bg-gradient-to-r from-violet-800 to-purple-900 px-4 py-3">
              <h2 className="text-white font-semibold text-sm">Support Chat</h2>
              {/* Make sure the X button uses this function */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-7 w-7 text-white hover:bg-purple-800/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SupportChat userId={userId} onClose={handleClose} isAdmin={isUserAdmin} />
          </div>
        </div>
      )}
    </>
  )
}
