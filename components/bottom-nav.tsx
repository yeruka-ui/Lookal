"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home as HomeIcon, Compass, User, ShoppingCart, MessageCircle } from "lucide-react"
import { useCart } from "@/lib/cart-context"

interface BottomNavProps {
    onCartOpen: () => void
}

export function BottomNav({ onCartOpen }: BottomNavProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { totalItems } = useCart()

    // Determine the current active view based on the pathname
    const currentView = pathname === "/"
        ? "home"
        : pathname.startsWith("/explore")
            ? "explore"
            : pathname.startsWith("/chat")
                ? "chat"
                : pathname.startsWith("/account")
                    ? "account"
                    : ""

    const handleNavigate = (path: string) => {
        router.push(path)
    }

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-full">
                {/* Home Button */}
                <button
                    onClick={() => handleNavigate("/")}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentView === "home" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
                    title="Home"
                >
                    <HomeIcon className="w-5 h-5" />
                </button>
                {/* Explore/Swipe Button -> Navigates to /explore */}
                <button
                    onClick={() => handleNavigate("/explore")}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentView === "explore" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
                    title="Explore"
                >
                    <Compass className="w-5 h-5" />
                </button>

                {/* Chat Button */}
                <button
                    onClick={() => handleNavigate("/chat")}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentView === "chat" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
                    title="Chat"
                >
                    <MessageCircle className="w-5 h-5" />
                </button>

                {/* Cart Button */}
                <button
                    onClick={onCartOpen}
                    className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 text-muted-foreground hover:bg-secondary"
                    title="Barter List"
                >
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
                    )}
                </button>

                {/* Account Button -> Navigates to /account (TBD route) */}
                <button
                    onClick={() => handleNavigate("/account")}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentView === "account" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
                    title="Account"
                >
                    <User className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}