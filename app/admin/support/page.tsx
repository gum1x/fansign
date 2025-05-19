"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MessageCircle, RefreshCw, Loader2, Send, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { getAllSupportMessages, adminReplySupportMessage, type SupportMessage } from "@/app/actions/supportActions"
import { deleteUserSupportMessages, deleteSupportMessage } from "@/app/actions/deleteSupportMessages"
import { isAdmin } from "@/utils/adminUtils"

interface UserMessageGroup {
  userId: string
  userInfo: any
  messages: SupportMessage[]
  hasUnread: boolean
}

const AdminSupportPage = () => {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userMessages, setUserMessages] = useState<UserMessageGroup[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize and check admin status
  useEffect(() => {
    const initTelegram = () => {
      try {
        // @ts-ignore
        if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
          // @ts-ignore
          const twa = window.Telegram.WebApp

          // Get user ID from Telegram WebApp
          if (twa.initDataUnsafe && twa.initDataUnsafe.user) {
            const telegramUserId = twa.initDataUnsafe.user.id.toString()
            setUserId(telegramUserId)

            // First check with the client-side function for immediate response
            const isClientAdmin = isAdmin(telegramUserId)
            setIsAuthorized(isClientAdmin)

            // Then verify with the server and load data if admin
            checkAdminStatus(telegramUserId)
          } else {
            // Fallback for development/preview
            setUserId("preview_user")
            setIsAuthorized(process.env.NODE_ENV === "development")
            setIsLoading(false)

            // In development, load messages for testing
            if (process.env.NODE_ENV === "development") {
              loadSupportMessages()
            }
          }

          twa.ready()
          twa.expand()
        } else {
          console.log("Telegram WebApp not available, using preview mode")
          // Fallback for preview/development
          setUserId("preview_user")
          setIsAuthorized(process.env.NODE_ENV === "development")
          setIsLoading(false)

          // In development, load messages for testing
          if (process.env.NODE_ENV === "development") {
            loadSupportMessages()
          }
        }
      } catch (error) {
        console.error("Error initializing Telegram Web App:", error)
        setUserId("preview_user")
        setIsAuthorized(process.env.NODE_ENV === "development")
        setIsLoading(false)
      }
    }

    initTelegram()
  }, [])

  // Scroll to bottom when messages change or when a user is selected
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [userMessages, selectedUser])

  // Check admin status
  const checkAdminStatus = async (userId: string) => {
    try {
      // First check with the client-side function for immediate response
      const isClientAdmin = isAdmin(userId)
      setIsAuthorized(isClientAdmin)

      // Then load messages if admin
      if (isClientAdmin) {
        await loadSupportMessages()
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load support messages
  const loadSupportMessages = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const result = await getAllSupportMessages()

      if (result.success) {
        setUserMessages(result.userMessages)
      } else {
        setErrorMessage("Failed to load messages: " + (result.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error loading support messages:", error)
      setErrorMessage("Failed to load messages. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Send reply
  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedUser || !userId) return

    setIsSending(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const result = await adminReplySupportMessage(selectedUser, replyMessage)

      if (result.success) {
        setReplyMessage("")
        setSuccessMessage("Reply sent successfully")
        await loadSupportMessages() // Reload messages to show the new reply

        // After reloading, make sure the same user is still selected
        setSelectedUser(selectedUser)
      } else {
        setErrorMessage("Failed to send reply: " + (result.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      setErrorMessage("Failed to send reply. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteUserMessages = async (userId: string) => {
    if (!confirm("Are you sure you want to delete ALL messages for this user? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const result = await deleteUserSupportMessages(userId)

      if (result.success) {
        setSuccessMessage("All messages for this user have been deleted")
        await loadSupportMessages()
        setSelectedUser(null)
      } else {
        setErrorMessage("Failed to delete messages: " + (result.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error deleting messages:", error)
      setErrorMessage("Failed to delete messages. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const result = await deleteSupportMessage(messageId)

      if (result.success) {
        setSuccessMessage("Message deleted successfully")
        await loadSupportMessages()
        // Keep the same user selected
        if (selectedUser) {
          setSelectedUser(selectedUser)
        }
      } else {
        setErrorMessage("Failed to delete message: " + (result.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      setErrorMessage("Failed to delete message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
          <CardContent className="pt-6 pb-4 flex items-center justify-center" style={{ minHeight: "300px" }}>
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-300">Initializing...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="text-purple-300 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
                Support Admin
              </CardTitle>
              <div className="w-5"></div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-4 bg-gradient-to-b from-gray-900/50 to-black/50">
            <div className="text-center space-y-6">
              <MessageCircle className="w-16 h-16 text-red-400 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-white">Access Denied</h3>
              <p className="text-gray-300">
                You do not have permission to access this page. This area is restricted to admin users only.
              </p>
              <Link href="/admin">
                <Button className="bg-purple-700 hover:bg-purple-600 text-white mt-4">Return to Admin</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/admin" className="text-purple-300 hover:text-white transition-colors">
            <div className="flex items-center">
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="text-sm">Back</span>
            </div>
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Support Admin
          </h1>
          <Button
            onClick={loadSupportMessages}
            variant="outline"
            size="sm"
            className="text-purple-400 border-purple-700/50 hover:bg-purple-900/20 h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-start space-x-2 text-sm text-red-400 p-2 bg-red-900/20 rounded-md border border-red-900/30">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-start space-x-2 text-sm text-green-400 p-2 bg-green-900/20 rounded-md border border-green-900/30">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User list */}
          <div className="md:col-span-1">
            <Card className="border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
                <CardTitle className="text-lg font-bold">Users</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : userMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No support messages yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
                    {userMessages.map((userGroup) => (
                      <div
                        key={userGroup.userId}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedUser === userGroup.userId ? "bg-purple-900/30" : "hover:bg-gray-800/60"
                        }`}
                        onClick={() => setSelectedUser(userGroup.userId)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{userGroup.userId}</p>
                            <p className="text-xs text-gray-400">{userGroup.messages.length} message(s)</p>
                            <p className="text-xs text-gray-400">
                              Last message:{" "}
                              {new Date(
                                userGroup.messages[userGroup.messages.length - 1]?.created_at || Date.now(),
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {userGroup.hasUnread && <div className="bg-red-500 rounded-full w-3 h-3 mr-2"></div>}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteUserMessages(userGroup.userId)
                              }}
                              title="Delete all messages"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat area */}
          <div className="md:col-span-2">
            <Card className="border-0 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)] overflow-hidden h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50 pb-4">
                <CardTitle className="text-lg font-bold">
                  {selectedUser ? `Chat with ${selectedUser}` : "Select a user"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                {!selectedUser ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select a user to view their messages</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {userMessages
                        .find((group) => group.userId === selectedUser)
                        ?.messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.is_from_admin ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                msg.is_from_admin
                                  ? "bg-gradient-to-r from-purple-700 to-violet-900 text-white"
                                  : "bg-gray-800 text-white"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <p className="text-sm">{msg.message}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-gray-400 hover:text-red-300 hover:bg-red-900/20 ml-2 -mt-1 -mr-1"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  title="Delete message"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="border-t border-gray-800 p-4">
                      <div className="flex space-x-2">
                        <Textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply here..."
                          className="min-h-[80px] bg-gray-800/40 border-purple-900/50 focus:border-purple-500 focus:ring-purple-500 placeholder:text-gray-500 text-gray-100 resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSendReply()
                            }
                          }}
                        />
                        <Button
                          onClick={handleSendReply}
                          disabled={isSending || !replyMessage.trim()}
                          className="bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950 text-white self-end h-10"
                        >
                          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSupportPage
