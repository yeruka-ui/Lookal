"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSocket } from "@/lib/socket-context"
import { useToast } from "@/hooks/use-toast"

export function NotificationListener() {
    const { socket, currentUserId } = useSocket()
    const { toast } = useToast()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!socket || !currentUserId) return

        // Handler for incoming chat messages
        const handleChatMessage = (data: any) => {
            // 1. Check if the message is meant for ME
            if (data.recipientId !== currentUserId) return

            // 2. Check if I am already looking at this chat (if so, no notification needed)
            const isViewingChat = pathname === `/chat/${data.tradeId}`
            if (isViewingChat) return

            console.log("🔔 Incoming Message Notification:", data)

            // 3. Trigger the Toast
            toast({
                title: "New Message",
                description: "You received a new message.",
                duration: 5000,
                action: (
                    <button 
                        className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs font-bold hover:bg-primary/90 transition-colors"
                        onClick={() => router.push(`/chat/${data.tradeId}?other_id=${data.senderId}`)}
                    >
                        Reply
                    </button>
                )
            })
        }

        socket.on("receive_trade_message", handleChatMessage)

        return () => {
            socket.off("receive_trade_message", handleChatMessage)
        }
    }, [socket, currentUserId, pathname, router, toast])

    return null // Invisible component
}