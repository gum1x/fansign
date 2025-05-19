"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  createSupportMessage,
  getUserSupportMessages,
  markMessageAsRead,
  type SupportMessage,
} from "@/app/actions/supportActions"
import { deleteUserSupportMessages } from "@/app/actions/deleteSupportMessages"

interface SupportChatProps {
  userId: string
  onClose?: () => void
  isAdmin?: boolean
}

export function SupportChat({ userId, onClose, isAdmin = false }: SupportChatProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isClearing, setIsClearing] = useState(false)

  // Add a function to handle closing the chat
  const handleClose = () => {
    if (onClose) onClose()
  }

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!userId) return

      setIsLoading(true)
      const result = await getUserSupportMessages(userId)
      setIsLoading(false)

      if (result.success) {
        setMessages(result.messages)

        // Mark admin messages as read
        for (const msg of result.messages) {
          if (msg.is_from_admin && !msg.is_read) {
            await markMessageAsRead(msg.id)
          }
        }
      }
    }

    loadMessages()

    // Set up polling to check for new messages every 10 seconds
    const interval = setInterval(loadMessages, 10000)
    return () => clearInterval(interval)
  }, [userId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !userId) return

    setIsSending(true)
    const result = await createSupportMessage(userId, message)
    setIsSending(false)

    if (result.success) {
      setMessage("")

      // Add message to the list
      const newMessage = result.message as SupportMessage
      setMessages((prev) => [...prev, newMessage])

      // Only add automatic response if there are no previous messages
      if (messages.length === 0) {
        setTimeout(() => {
          const autoResponse: SupportMessage = {
            id: `auto-${Date.now()}`,
            user_id: userId,
            message: "Thank you for your message. Our support team will respond within 24 hours.",
            is_from_admin: true,
            is_read: true,
            parent_message_id: null,
            created_at: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, autoResponse])
        }, 1000)
      }
    }
  }

  // Add function to clear all messages
  const handleClearChat = async () => {
    if (!confirm("Are you sure you want to clear all messages? This action cannot be undone.")) {
      return
    }

    setIsClearing(true)
    try {
      const result = await deleteUserSupportMessages(userId)
      if (result.success) {
        setMessages([])
      } else {
        alert("Failed to clear chat: " + (result.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error clearing chat:", error)
      alert("Failed to clear chat. Please try again.")
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-center">
            <div className="px-4">
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs mt-2">
                Send a message to our support team and we'll get back to you within 24 hours.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.is_from_admin ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.is_from_admin
                    ? "bg-gray-800 text-white"
                    : "bg-gradient-to-r from-purple-700 to-violet-900 text-white"
                }`}
              >
                <p className="text-sm break-words">{msg.message}</p>
                <p className="text-[10px] text-gray-400 mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 p-2">
        <div className="flex space-x-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[60px] max-h-[120px] text-sm bg-gray-800/40 border-purple-900/50 focus:border-purple-500 focus:ring-purple-500 placeholder:text-gray-500 text-gray-100 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
            className="bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950 text-white self-end h-10 w-10 p-0"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="border-t border-gray-800 p-2 flex justify-between">
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            disabled={isClearing || messages.length === 0}
            className="text-xs text-red-400 border-red-900/50 hover:bg-red-900/20 flex items-center"
          >
            {isClearing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Trash2 className="h-3 w-3 mr-1" />}
            Clear Chat
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleClose}
          className="text-xs text-gray-400 border-gray-700 hover:bg-gray-800"
        >
          Close Chat
        </Button>
      </div>
    </div>
  )
}
