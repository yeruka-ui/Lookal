"use client"

import type { Product, Shop } from "@/lib/mock-data"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { X, Check, ShoppingCart, Package, Info, MapPin } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area" // Added for better scrolling UX

interface ProductDetailModalProps {
  product: Product
  shop: Shop
  onClose: () => void // This is the function that handles the card reset in ProductSwiper
}

export function ProductDetailModal({ product, shop, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    if (product.inStock) {
      addItem(product, shop)
      onClose() // Closes modal AND resets the underlying swipe card
    }
  }

  return (
    // FIX APPLIED HERE: Added 'pb-24' to the fixed container on mobile (default) to lift the modal above the BottomNav.
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pb-24 sm:p-4 sm:pb-4"> 
      {/* Backdrop overlay for closing - calling onClose here ensures the card resets */}
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />

      {/* Modal Content container */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-card rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
        
        {/* Scrollable Content Area - Using ScrollArea for better UX */}
        <ScrollArea className="h-[90vh] sm:max-h-[calc(90vh)]">
          
          {/* Image Section - Maximized Visual Impact */}
          <div className="relative aspect-video w-full overflow-hidden">
            <img 
              src={product.image || "/placeholder.svg"} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
            />
            
            {/* Out of Stock Banner */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <span className="bg-destructive text-destructive-foreground px-6 py-2 rounded-full font-bold tracking-wide shadow-lg transform -rotate-6 border-2 border-white/80">Out of Stock</span>
              </div>
            )}
            
            {/* Floating Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-md"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product Info & Details */}
          <div className="p-6 space-y-6">
            
            {/* Title, Price, and Shop - Prominent Typography */}
            <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
              <div>
                <h3 className="text-3xl font-extrabold text-card-foreground leading-tight tracking-tight">{product.name}</h3>
                <p className="text-base font-medium text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary shrink-0"/>
                    From <span className="text-card-foreground font-semibold">{shop.name}</span>
                </p>
              </div>
              <span className="text-4xl font-black text-primary">${product.price.toFixed(2)}</span>
            </div>

            {/* Description Section */}
            <div>
              <h4 className="font-bold text-lg text-card-foreground mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary shrink-0" />
                About this Item
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Technical Details List - Enhanced readability */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-lg text-card-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-primary shrink-0" />
                Specifications
              </h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {product.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 translate-y-0.5" />
                    <span className="flex-1">{detail}</span>
                  </li>
                ))}
                {product.size && (
                   <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 translate-y-0.5" />
                    Size: <span className="capitalize font-semibold text-card-foreground">{product.size}</span>
                   </li>
                )}
              </ul>
            </div>

            {/* Tags/Status Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-semibold rounded-full">
                {product.category}
              </span>
              <span
                className={`flex items-center gap-1.5 text-sm font-semibold ${product.inStock ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"} px-3 py-1 rounded-full`}
              >
                {product.inStock ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {product.inStock ? "Ready to Ship" : "Currently Unavailable"}
              </span>
            </div>
          </div>
          
          {/* Add vertical spacing to prevent content hiding behind the sticky footer */}
          <div className="h-20 sm:h-0" />
          
        </ScrollArea>

        {/* Sticky Footer for Call-to-Action */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-card border-t border-border shadow-2xl">
          <Button 
            onClick={handleAddToCart} 
            disabled={!product.inStock} 
            className="w-full h-12 text-base font-semibold transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  )
}