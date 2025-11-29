"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { shops } from "@/lib/mock-data"
import { ArrowLeft, Send, Phone, Video, MoreVertical, Image as ImageIcon, Smile } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
    id: string
    text: string
    sender: "user" | "shop"
    timestamp: Date
}

export default function ChatRoomPage() {
    const params = useParams()
    const router = useRouter()
    const shopId = params.id as string
    const shop = shops.find(s => s.id === shopId)

    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Initialize with some mock messages
    useEffect(() => {
        if (shop) {
            setMessages([
                {
                    id: "1",
                    text: `Hi! Welcome to ${shop.name}. How can we help you today?`,
                    sender: "shop",
                    timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
                }
            ])
        }
    }, [shop])

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputValue.trim()) return

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: "user",
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newMessage])
        setInputValue("")
        setIsTyping(true)

        // Mock shop reply
        setTimeout(() => {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                text: "That sounds like a great offer! Let me check our inventory.",
                sender: "shop",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, reply])
            setIsTyping(false)
        }, 2000)
    }

    if (!shop) return <div className="p-8 text-center">Shop not found</div>

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                            <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                    </div>

                    <div>
                        <h2 className="font-semibold text-sm leading-tight">{shop.name}</h2>
                        <p className="text-xs text-green-600 font-medium">Online</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.sender === "user"
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-white border border-border rounded-bl-none"
                                }`}
                        >
                            <p>{msg.text}</p>
                            <p className={`text-[10px] mt-1 text-right ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white border border-border px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 bg-secondary/50 p-1.5 pr-2 rounded-full border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                >
                    <button type="button" className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                        <ImageIcon className="w-5 h-5" />
                    </button>

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
                    />

                    <button type="button" className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                        <Smile className="w-5 h-5" />
                    </button>

                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    )
}
