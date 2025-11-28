// yeruka-ui/lookal/klyde2/components/main-layout-wrapper.tsx

"use client"

import type React from "react"
import { useState } from "react"
import { CartSheet } from "@/components/cart-sheet"
import { CheckoutModal } from "@/components/checkout-modal"
import { BottomNav } from "@/components/bottom-nav"
import { TransitionWrapper } from "./transition-wrapper"
import { useUI } from "@/lib/ui-context" // <-- ADDED
import { useCart } from "@/lib/cart-context"

export function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const { isFullScreenMode } = useUI() // <-- USE CONTEXT

  // Navigation is hidden only when a component (ProductSwiper) sets isFullScreenMode to true
  const hideNav = isFullScreenMode 

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
        open={cartOpen} 
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