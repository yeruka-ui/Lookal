"use client"

import type React from "react"
import { useState } from "react"
import { CartSheet } from "@/components/cart-sheet"
import { CheckoutModal } from "@/components/checkout-modal"
import { BottomNav } from "@/components/bottom-nav"
import { TransitionWrapper } from "./transition-wrapper"
import { useUI } from "@/lib/ui-context"
import { useCart } from "@/lib/cart-context"
import { usePathname } from "next/navigation"

export function MainLayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const [checkoutOpen, setCheckoutOpen] = useState(false)
    const { isFullScreenMode, isCartOpen, setCartOpen } = useUI()
    const { totalItems } = useCart()
    const pathname = usePathname()

    // Navigation is hidden when isFullScreenMode is true OR when on a product page
    const hideNav = isFullScreenMode || pathname?.startsWith("/product/")

    const handleCheckout = () => {
        setCartOpen(false)
        setCheckoutOpen(true)
    }

    const handleCloseCheckout = () => {
        setCheckoutOpen(false)
    }

    return (
        <>
            {/* Remove bottom padding when the nav is hidden */}
            <div className={`min-h-screen bg-background ${hideNav ? 'pb-0' : 'pb-20'}`}>

                <TransitionWrapper>
                    {children}
                </TransitionWrapper>
            </div>

            {/* Conditionally render the BottomNav */}
            {!hideNav && (
                <BottomNav
                    onCartOpen={() => setCartOpen(true)}
                />
            )}

            <CartSheet
                open={isCartOpen}
                onClose={() => setCartOpen(false)}
                onCheckout={handleCheckout}
            />

            <CheckoutModal
                open={checkoutOpen}
                onClose={handleCloseCheckout}
            />
        </>
    )
}