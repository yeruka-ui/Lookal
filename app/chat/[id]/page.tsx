"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSocket } from "@/lib/socket-context" 
import { ArrowLeft, Send, Image as ImageIcon, X } from "lucide-react" // Removed Phone, Video imports
import { motion } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface Message {
    tradeId: string
    message: string
    senderId: string
    timestamp: number
    attachment?: string
}

export default function ChatRoomPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const { socket, currentUserId } = useSocket() 
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const tradeId = params.id as string
    const recipientId = searchParams.get('other_id')

    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    useEffect(() => {
        if (!socket || !tradeId) return

        socket.emit("get_chat_history", tradeId)

        const handleHistory = (history: any[]) => {
            const sorted = history.sort((a, b) => a.timestamp - b.timestamp)
            setMessages(sorted)
        }

        const handleLiveMessage = (data: any) => {
            if(data.tradeId !== tradeId) return;
            setMessages((prev) => [...prev, data])
            setIsOtherUserTyping(false) 
        }

        const handleTyping = (data: { tradeId: string, isTyping: boolean }) => {
            if (data.tradeId === tradeId) {
                setIsOtherUserTyping(data.isTyping)
            }
        }

        socket.on("chat_history", handleHistory)
        socket.on("receive_trade_message", handleLiveMessage)
        socket.on("display_typing", handleTyping)

        return () => {
            socket.off("chat_history", handleHistory)
            socket.off("receive_trade_message", handleLiveMessage)
            socket.off("display_typing", handleTyping)
        }
    }, [socket, tradeId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isOtherUserTyping])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)

        if (socket && recipientId) {
            socket.emit("typing", { recipientId, tradeId, isTyping: true })
            
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing", { recipientId, tradeId, isTyping: false })
            }, 1000)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Image is too large! Max 5MB allowed.")
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedFile(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if ((!inputValue.trim() && !selectedFile) || !socket || !recipientId || !currentUserId) return

        const payload = {
            tradeId,
            senderId: currentUserId,
            recipientId: recipientId,
            message: inputValue,
            attachment: selectedFile || undefined,
            timestamp: Date.now()
        }

        socket.emit("send_trade_message", payload)
        
        setInputValue("")
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        socket.emit("typing", { recipientId, tradeId, isTyping: false })
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="p-4 border-b border-border bg-background flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6"/>
                    </button>
                    <div>
                        <h1 className="font-bold text-foreground">Trade Negotiation</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">ID: {tradeId.slice(-4)}</span>
                            {isOtherUserTyping && (
                                <span className="text-xs text-primary font-medium animate-pulse">typing...</span>
                            )}
                        </div>
                    </div>
                </div>
                {/* REMOVED VIDEO/PHONE ICONS HERE */}
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-10 opacity-50">
                        <p>No messages yet.</p>
                        <p>Start the conversation or send an image!</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-white border border-border rounded-bl-none"}`}>
                                {msg.attachment && (
                                    <div 
                                        className="mb-2 rounded-lg overflow-hidden border border-black/10 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setPreviewImage(msg.attachment!)}
                                    >
                                        <img src={msg.attachment} alt="Attachment" className="max-w-full h-auto max-h-60 object-cover" />
                                    </div>
                                )}
                                {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                                <p className={`text-[10px] mt-1 text-right opacity-70`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    )
                })}

                {isOtherUserTyping && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
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
            <div className="p-4 border-t border-border bg-background">
                {selectedFile && (
                    <div className="relative inline-block mb-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="relative rounded-xl overflow-hidden border border-border h-24 w-24 bg-secondary">
                            <img src={selectedFile} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                                className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        accept="image/*"
                    />
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-full hover:bg-secondary text-muted-foreground transition-colors mb-1"
                        title="Attach image"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 bg-secondary rounded-2xl px-4 py-3 min-h-[44px]">
                        <input 
                            className="w-full bg-transparent text-sm focus:outline-none"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={handleInputChange} 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={(!inputValue.trim() && !selectedFile)}
                        className="p-3 bg-primary text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all mb-1 shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>

            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                    {previewImage && (
                        <img 
                            src={previewImage} 
                            alt="Full Preview" 
                            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}