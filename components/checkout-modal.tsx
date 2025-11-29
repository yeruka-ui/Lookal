"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Check, Package, CreditCard } from "lucide-react"

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState<"details" | "success">("details")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate order processing
    setTimeout(() => {
      setLoading(false)
      setStep("success")
      clearCart()
    }, 1500)
  }

  const handleClose = () => {
    setStep("details")
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {step === "success" ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for supporting local businesses. You&apos;ll receive updates on your order soon.
            </p>
            <div className="flex items-center justify-center gap-2 p-3 bg-secondary rounded-lg mb-6">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm text-card-foreground">
                Order #LM{Math.random().toString(36).substr(2, 8).toUpperCase()}
              </span>
            </div>
            <Button onClick={handleClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-card-foreground">Checkout</h2>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order summary */}
            <div className="p-4 bg-secondary/50 border-b border-border">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">{items.length} items</span>
                <span className="font-semibold text-card-foreground">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {items.map((item) => (
                  <img
                    key={item.product.id}
                    src={item.product.image || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" required />
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-card-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                  {loading ? "Processing..." : "Place Order"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  By placing your order, you agree to support local businesses
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
