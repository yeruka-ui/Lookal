"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getConversations, getMessages, sendMessage, subscribeToConversation, markConversationAsRead } from "@/lib/supabase/messages"
import type { Conversation, Message } from "@/lib/supabase/types"

export default function ChatPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch conversations on mount
  useEffect(() => {
    async function fetchConversations() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getConversations()
        setConversations(data)
      } catch (err) {
        console.error('Error fetching conversations:', err)
        setError('Failed to load conversations. Please check your connection and try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [])

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([])
      return
    }

    // Capture the conversation ID to avoid null reference issues in async operations
    const conversationId = selectedConversation.id

    async function fetchMessages() {
      try {
        const data = await getMessages(conversationId)
        setMessages(data)
        // Mark conversation as read
        await markConversationAsRead(conversationId)
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unread: false } : c))
        )
      } catch (err) {
        console.error('Error fetching messages:', err)
      }
    }

    fetchMessages()

    // Subscribe to real-time messages for this conversation
    const channel = subscribeToConversation(conversationId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage])
    })

    // Cleanup subscription on unmount or conversation change
    return () => {
      channel.unsubscribe()
    }
  }, [selectedConversation])

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        const message = await sendMessage(selectedConversation.id, "seller", newMessage)
        setMessages((prev) => [...prev, message])
        setNewMessage("")
        
        // Update conversation's last message in the list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? { ...c, last_message: newMessage, last_message_at: new Date().toISOString() }
              : c
          )
        )
      } catch (err) {
        console.error('Error sending message:', err)
        alert('Failed to send message. Please try again.')
      }
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleBack = () => {
    if (selectedConversation) {
      setSelectedConversation(null)
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-background dotted-bg">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-primary/20 bg-card">
          {selectedConversation ? (
            <>
              <button
                onClick={handleBack}
                className="text-foreground/60 hover:text-foreground"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-foreground">{selectedConversation.buyer_name}</h1>
            </>
          ) : (
            <>
              <button onClick={handleBack} className="text-foreground/60 hover:text-foreground">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <p className="text-foreground/60">Loading conversations...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Conversations List */}
          {!isLoading && !error && !selectedConversation && (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className="w-full p-4 rounded-lg hover:bg-foreground/5 border border-primary/10 text-left transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{conv.buyer_image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{conv.buyer_name}</p>
                    </div>
                    {conv.unread && <span className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></span>}
                  </div>
                  <p className="text-sm text-foreground/60 truncate">{conv.last_message}</p>
                </button>
              ))}
            </div>
          )}

          {/* Messages View */}
          {!isLoading && !error && selectedConversation && (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "seller" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg text-sm ${
                      msg.sender === "seller"
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/10 text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area - Only show when in chat view */}
        {selectedConversation && (
          <div className="border-t border-primary/20 p-4 bg-card flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage()
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg bg-background border border-primary/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
