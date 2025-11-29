"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home as HomeIcon, Compass, User } from "lucide-react" // Removed ShoppingCart

interface BottomNavProps {
    onCartOpen: () => void // Kept for MainLayoutWrapper compatibility, but unused here
    // Removed totalItems
}

export function BottomNav({ onCartOpen }: BottomNavProps) { // Removed totalItems parameter
    const router = useRouter()
    const pathname = usePathname()

    // Determine the current active view based on the pathname
    const currentView = pathname === "/"
        ? "home"
        : pathname.startsWith("/explore")
            ? "explore"
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