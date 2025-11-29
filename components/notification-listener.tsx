"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSocket } from "@/lib/socket-context"
import { useToast } from "@/components/ui/use-toast"

export function NotificationListener() {
    const { socket, currentUserId } = useSocket()
    const { toast } = useToast()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!socket || !currentUserId) return

        // 1. Handle Chat Messages
        const handleChatMessage = (data: any) => {
            if (data.recipientId !== currentUserId) return
            if (pathname === `/chat/${data.tradeId}`) return // Don't notify if already looking at it

            toast({
                title: "New Message",
                description: "You received a new message.",
                duration: 4000,
                action: (
                    <button 
                        className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold hover:bg-primary/90"
                        onClick={() => router.push(`/chat/${data.tradeId}?other_id=${data.senderId}`)}
                    >
                        Reply
                    </button>
                )
            })
        }

        // 2. Handle New Trade Proposals (FIXED: Added this handler)
        const handleTradeProposal = (data: any) => {
            // Only notify the shop owner
            if (data.shopOwnerId !== currentUserId) return
            
            // Don't toast if already on marketplace page
            if (pathname === '/marketplace') return

            console.log("🔔 Trade Proposal Notification:", data)

            toast({
                title: "New Trade Request",
                description: `Someone wants to trade for your ${data.items[0]?.name || 'items'}!`,
                duration: 5000,
                action: (
                    <button 
                        className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold hover:bg-primary/90"
                        onClick={() => router.push('/marketplace')}
                    >
                        View
                    </button>
                )
            })
        }

        socket.on("receive_trade_message", handleChatMessage)
        socket.on("trade_proposed", handleTradeProposal)

        return () => {
            socket.off("receive_trade_message", handleChatMessage)
            socket.off("trade_proposed", handleTradeProposal)
        }
    }, [socket, currentUserId, pathname, router, toast])

    return null
}