"use client"

import { useState } from "react"
import { X, Send, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  sender: "buyer" | "seller"
  text: string
  timestamp: Date
}

interface Conversation {
  id: string
  buyerName: string
  buyerImage: string
  lastMessage: string
  timestamp: Date
  unread: boolean
  messages: Message[]
}

interface ChatPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatPopup({ isOpen, onClose }: ChatPopupProps) {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      buyerName: "Maria Santos",
      buyerImage: "👩‍🦱",
      lastMessage: "Great! I'll place an order soon.",
      timestamp: new Date(Date.now() - 600000),
      unread: false,
      messages: [
        {
          id: "1",
          sender: "buyer",
          text: "Hi, do you have any discounts for bulk orders?",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: "2",
          sender: "seller",
          text: "Yes! We offer 10% off for orders over 10 items.",
          timestamp: new Date(Date.now() - 1800000),
        },
        {
          id: "3",
          sender: "buyer",
          text: "Great! I'll place an order soon.",
          timestamp: new Date(Date.now() - 600000),
        },
      ],
    },
    {
      id: "2",
      buyerName: "Juan Dela Cruz",
      buyerImage: "👨‍💼",
      lastMessage: "Do you have this in stock?",
      timestamp: new Date(Date.now() - 1800000),
      unread: true,
      messages: [
        {
          id: "1",
          sender: "buyer",
          text: "Hi! Do you have the wireless headphones?",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: "2",
          sender: "seller",
          text: "Yes, we have 45 units in stock.",
          timestamp: new Date(Date.now() - 2400000),
        },
        {
          id: "3",
          sender: "buyer",
          text: "Do you have this in stock?",
          timestamp: new Date(Date.now() - 1800000),
        },
      ],
    },
    {
      id: "3",
      buyerName: "Ana Rodriguez",
      buyerImage: "👩",
      lastMessage: "Thank you for the fast delivery!",
      timestamp: new Date(Date.now() - 7200000),
      unread: false,
      messages: [
        {
          id: "1",
          sender: "buyer",
          text: "How much for 5 USB cables?",
          timestamp: new Date(Date.now() - 5400000),
        },
        {
          id: "2",
          sender: "seller",
          text: "That would be 74.95 with the bulk discount.",
          timestamp: new Date(Date.now() - 4800000),
        },
        {
          id: "3",
          sender: "buyer",
          text: "Thank you for the fast delivery!",
          timestamp: new Date(Date.now() - 7200000),
        },
      ],
    },
  ])

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === selectedConversation.id) {
          const updatedMessages = [
            ...conv.messages,
            {
              id: Date.now().toString(),
              sender: "seller" as const,
              text: newMessage,
              timestamp: new Date(),
            },
          ]
          return { ...conv, messages: updatedMessages }
        }
        return conv
      })
      setConversations(updatedConversations)
      setSelectedConversation(updatedConversations.find((c) => c.id === selectedConversation.id) || null)
      setNewMessage("")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 w-80 h-96 bg-card border-2 border-primary rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20">
        {selectedConversation ? (
          <>
            <button
              onClick={() => setSelectedConversation(null)}
              className="text-foreground/60 hover:text-foreground mr-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-foreground">{selectedConversation.buyerName}</h3>
          </>
        ) : (
          <h3 className="font-bold text-foreground">Messages</h3>
        )}
        <button onClick={onClose} className="text-foreground/60 hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content - Conversations List or Chat View */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedConversation ? (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className="w-full p-3 rounded-lg hover:bg-foreground/5 border border-primary/10 text-left transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{conv.buyerImage}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{conv.buyerName}</p>
                  </div>
                  {conv.unread && <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0"></span>}
                </div>
                <p className="text-xs text-foreground/60 truncate">{conv.lastMessage}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {selectedConversation.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "seller" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.sender === "seller" ? "bg-primary text-primary-foreground" : "bg-foreground/10 text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input - Only show when in chat view */}
      {selectedConversation && (
        <div className="border-t border-primary/20 p-3 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSendMessage()
            }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg bg-background border border-primary/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
  )
}
