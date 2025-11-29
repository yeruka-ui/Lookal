"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSocket } from "@/lib/socket-context" 
import { ArrowLeft, Send } from "lucide-react"
import { motion } from "framer-motion"

export default function ChatRoomPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { socket, currentUserId } = useSocket() 
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const tradeId = params.id as string
    const recipientId = searchParams.get('other_id')

    const [messages, setMessages] = useState<any[]>([])
    const [inputValue, setInputValue] = useState("")
    
    useEffect(() => {
        if (!socket || !tradeId) return

        // 1. Request History on Load
        socket.emit("get_chat_history", tradeId)

        // 2. Handle History Response
        const handleHistory = (history: any[]) => {
            // Sort chronologically just in case
            const sorted = history.sort((a, b) => a.timestamp - b.timestamp)
            setMessages(sorted)
        }

        // 3. Handle Live Messages
        const handleLiveMessage = (data: any) => {
            if(data.tradeId !== tradeId) return;
            setMessages((prev) => [...prev, data])
        }

        socket.on("chat_history", handleHistory)
        socket.on("receive_trade_message", handleLiveMessage)

        return () => {
            socket.off("chat_history", handleHistory)
            socket.off("receive_trade_message", handleLiveMessage)
        }
    }, [socket, tradeId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || !socket || !recipientId) return

        const payload = {
            tradeId,
            senderId: currentUserId,
            recipientId: recipientId,
            message: inputValue
        }

        socket.emit("send_trade_message", payload)
        setInputValue("")
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="p-4 border-b border-border bg-background flex items-center gap-4">
                <button onClick={() => router.back()}><ArrowLeft className="w-6 h-6"/></button>
                <h1 className="font-bold">Trade Negotiation</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-10 opacity-50">
                        <p>This is the start of your negotiation.</p>
                        <p>Be polite and specific about your trade!</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    // Check if I sent this message
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[75%] p-3 rounded-xl text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                                <p>{msg.message}</p>
                                <p className={`text-[10px] mt-1 text-right opacity-70`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-2">
                <input 
                    className="flex-1 bg-secondary rounded-full px-4 text-sm focus:outline-none"
                    placeholder="Negotiate..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                />
                <button type="submit" className="p-3 bg-primary text-primary-foreground rounded-full">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    )
}