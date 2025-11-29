"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home as HomeIcon, Compass, User, ShoppingCart, Store } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useSocket } from "@/lib/socket-context"
import { useEffect, useState } from "react"

interface BottomNavProps {
    onCartOpen: () => void
}

export function BottomNav({ onCartOpen }: BottomNavProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { totalItems } = useCart()
    const { socket, currentUserId } = useSocket()
    const [hasNotification, setHasNotification] = useState(false)

    const currentView = pathname === "/" ? "home"
        : pathname.startsWith("/explore") ? "explore"
        : pathname.startsWith("/marketplace") ? "marketplace"
        : pathname.startsWith("/account") ? "account"
        : ""

    const handleNavigate = (path: string) => {
        if (path === "/marketplace") setHasNotification(false) 
        router.push(path)
    }

    // Only listen for "Trade Proposals" here (for the red dot on Marketplace tab)
    useEffect(() => {
        if(!socket) return;
        const handleProposal = (data: any) => {
            if (data.shopOwnerId === currentUserId) {
                setHasNotification(true);
            }
        };
        socket.on("trade_proposed", handleProposal);
        return () => { socket.off("trade_proposed", handleProposal) }
    }, [socket, currentUserId])

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-full">
                
                <button onClick={() => handleNavigate("/")} className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentView === "home" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}>
                    <HomeIcon className="w-5 h-5" />
                </button>
                
                <button onClick={() => handleNavigate("/explore")} className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentView === "explore" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}>
                    <Compass className="w-5 h-5" />
                </button>

                <button
                    onClick={() => handleNavigate("/marketplace")}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentView === "marketplace" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
                    title="Marketplace"
                >
                    <Store className="w-5 h-5" />
                    {hasNotification && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                    )}
                </button>

                <button onClick={onCartOpen} className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 text-muted-foreground hover:bg-secondary">
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
                    )}
                </button>

                <button onClick={() => handleNavigate("/account")} className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentView === "account" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}>
                    <User className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}