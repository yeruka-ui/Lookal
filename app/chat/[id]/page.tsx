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

    // "tradeId" is in the URL path, "other_id" (recipient) is a query param
    const tradeId = params.id as string
    const recipientId = searchParams.get('other_id') // Passed from Marketplace page

    const [messages, setMessages] = useState<any[]>([])
    const [inputValue, setInputValue] = useState("")

    useEffect(() => {
        if (!socket) return
        const handleMsg = (data: any) => {
            // Only show messages for this specific trade
            if (data.tradeId !== tradeId) return;

            setMessages((prev) => [...prev, {
                ...data,
                sender: data.senderId === currentUserId ? "user" : "other"
            }])
        }
        socket.on("receive_trade_message", handleMsg)
        return () => { socket.off("receive_trade_message", handleMsg) }
    }, [socket, currentUserId, tradeId])

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || !socket || !recipientId) return

        const payload = {
            tradeId,
            senderId: currentUserId,
            recipientId: recipientId, // Send to the person we clicked "Negotiate" with
            message: inputValue
        }

        socket.emit("send_trade_message", payload)
        setInputValue("")
    }

    // (Render logic is similar to before, just cleaner...)
    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="p-4 border-b border-border bg-background flex items-center gap-4">
                <button onClick={() => router.back()}><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="font-bold">Trade Negotiation</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[75%] p-3 rounded-xl text-sm ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                            {msg.message}
                        </div>
                    </motion.div>
                ))}
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