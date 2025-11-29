"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, ShoppingBag, Trash2, Check, ArrowRight, MessageCircle } from "lucide-react"
import type { CartItem } from "@/lib/mock-data"
import { useState } from "react"

interface CartSheetProps {
    open: boolean
    onClose: () => void
    onCheckout: () => void
}

function CartItemReview({ item, removeItem, updateQuantity }: {
    item: CartItem,
    removeItem: (id: string) => void,
    updateQuantity: (id: string, quantity: number) => void,
}) {
    return (
        <div key={item.product.id} className="flex gap-3 p-3 bg-secondary/50 rounded-xl">
            <img
                src={item.product.image || "/placeholder.svg"}
                alt={item.product.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-card-foreground truncate">{item.product.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{item.shop.name}</p>
                <div className="mt-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Barter For:</p>
                    <p className="text-sm font-bold text-primary leading-tight">{item.product.barterValue}</p>
                </div>
            </div>

            {/* Quantity & Remove Controls */}
            <div className="flex flex-col items-end justify-between min-w-16 pl-2 border-l border-border/50 ml-1">
                <button
                    onClick={() => removeItem(item.product.id)}
                    className="w-6 h-6 rounded-full text-muted-foreground hover:text-destructive transition-colors mb-auto"
                    title="Remove item"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 mt-2">
                    <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export function CartSheet({ open, onClose, onCheckout }: CartSheetProps) {
    const { items, removeItem, updateQuantity, totalItems } = useCart()

    if (!open) return null

    const isCartEmpty = items.length === 0;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-card-foreground">
                            Barter Request List
                        </h2>
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

                {isCartEmpty ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-card-foreground mb-1">List is empty</h3>
                        <p className="text-sm text-muted-foreground">Add items you want to trade for!</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="flex items-center justify-between px-1 pb-2">
                                <p className="text-xs text-muted-foreground">
                                    Review your items and proposed trades.
                                </p>
                            </div>
                            {items.map(item => (
                                <CartItemReview
                                    key={item.product.id}
                                    item={item}
                                    removeItem={removeItem}
                                    updateQuantity={updateQuantity}
                                />
                            ))}
                        </div>

                        {/* Footer Action Area */}
                        <div className="p-4 bg-card border-t border-border flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <Button
                                onClick={onCheckout}
                                className="w-full h-12 text-base font-semibold shadow-md active:scale-[0.98] transition-transform"
                            >
                                <span className="flex items-center">
                                    Send Barter Request <MessageCircle className="ml-2 w-4 h-4" />
                                </span>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}