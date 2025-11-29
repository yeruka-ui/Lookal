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

        // 1. Handle Chat Messages (New Messages within a Negotiation)
        const handleChatMessage = (data: any) => {
            // 1. If I am the SENDER, IGNORE the message (it's the echo)
            if (data.senderId === currentUserId) return

            // 2. If I am the RECIPIENT, proceed to check if I should be notified
            if (data.recipientId === currentUserId) {
                const isViewingChat = pathname === `/chat/${data.tradeId}`
                
                // If I am NOT viewing the chat, show a notification
                if (!isViewingChat) { 
                    toast({
                        title: "New Message",
                        description: `You received a message in negotiation #${data.tradeId.slice(-4)}`,
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
            }
        }

        // 2. Handle New Trade Proposals (The initial Request)
        const handleTradeProposal = (data: any) => {
            // Only notify the shop owner about the initial listing
            if (data.shopOwnerId !== currentUserId) return
            
            // Don't toast if already on marketplace page
            if (pathname === '/marketplace') return

            toast({
                title: "New Trade Request",
                description: `A customer listed a trade request for your ${data.items[0]?.name || 'items'}!`,
                duration: 5000,
                action: (
                    <button 
                        className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs font-bold hover:bg-primary/90 transition-colors"
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