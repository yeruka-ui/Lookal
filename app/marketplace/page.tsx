"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSocket } from "@/lib/socket-context"
import { MessageCircle, PackageOpen, Clock } from "lucide-react"

interface TradeRequest {
    tradeId: string;
    proposerId: string;
    shopOwnerId: string;
    items: { name: string; quantity: number; img?: string }[];
    offerDetails: string;
    timestamp: number;
}

export default function MarketplacePage() {
    const router = useRouter()
    const { socket, currentUserId } = useSocket()
    const [requests, setRequests] = useState<TradeRequest[]>([])

    useEffect(() => {
        if (!socket || !currentUserId) return

        // 1. Explicitly ask for history using our ID
        console.log("Requesting history for:", currentUserId)
        socket.emit('get_trades', currentUserId)

        // 2. Handle History Response
        const handleHistory = (history: TradeRequest[]) => {
            console.log("History loaded:", history.length, "items")
            setRequests(history.sort((a, b) => b.timestamp - a.timestamp))
        }

        // 3. Handle Live Updates
        const handleNewProposal = (data: TradeRequest) => {
            console.log("Live proposal received")
            setRequests((prev) => [data, ...prev])
        }

        socket.on("marketplace_history", handleHistory)
        socket.on("trade_proposed", handleNewProposal)

        return () => {
            socket.off("marketplace_history", handleHistory)
            socket.off("trade_proposed", handleNewProposal)
        }
    }, [socket, currentUserId])

    const handleNegotiate = (req: TradeRequest) => {
        const isMeProposer = req.proposerId === currentUserId;
        // If I created it, I talk to the shop. If I received it, I talk to the proposer.
        const otherPartyId = isMeProposer ? req.shopOwnerId : req.proposerId;

        router.push(`/chat/${req.tradeId}?other_id=${otherPartyId}`)
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
                <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
                <p className="text-sm text-muted-foreground">Active trade requests & listings</p>
            </div>

            <div className="p-4 space-y-4">
                {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <PackageOpen className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No active trades</h3>
                        <p className="text-sm">Proposals you send or receive will appear here.</p>
                    </div>
                ) : (
                    requests.map((req) => {
                        const isMyRequest = req.proposerId === currentUserId;
                        return (
                            <div key={req.tradeId} className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-2">
                                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider ${isMyRequest ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                    {isMyRequest ? "Sent" : "Received"}
                                </div>

                                <div className="mb-3 pr-8">
                                    <h4 className="font-bold text-base flex items-center gap-2">
                                        {isMyRequest ? "You offered:" : "New Offer:"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground italic line-clamp-2 mt-1">"{req.offerDetails}"</p>
                                </div>

                                <div className="bg-secondary/50 p-3 rounded-lg mb-4 text-xs">
                                    <span className="font-semibold text-foreground">In exchange for:</span>
                                    <ul className="mt-1 text-muted-foreground grid grid-cols-2 gap-1">
                                        {req.items.map((item, i) => (
                                            <li key={i} className="flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" /> 
                                                {item.quantity}x {item.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button 
                                    onClick={() => handleNegotiate(req)}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-md"
                                >
                                    <MessageCircle className="w-4 h-4" /> 
                                    {isMyRequest ? "View Negotiation" : "Review & Reply"}
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}