"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"

interface CartSheetProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartSheet({ open, onClose, onCheckout }: CartSheetProps) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-card-foreground">Your Cart</h2>
            {totalItems > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(100vh - 180px)" }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-1">Cart is empty</h3>
              <p className="text-sm text-muted-foreground">Swipe right on products to add them!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-3 p-3 bg-secondary/50 rounded-xl">
                <img
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground truncate">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{item.shop.name}</p>
                  <p className="text-sm font-semibold text-primary mt-1">${item.product.price.toFixed(2)}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-auto w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-card-foreground">${totalPrice.toFixed(2)}</span>
            </div>
            <Button onClick={onCheckout} className="w-full h-12 text-base font-semibold">
              Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
