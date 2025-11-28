"use client"

import type { Product, Shop } from "@/lib/mock-data"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { X, Check, ShoppingCart, Package } from "lucide-react"

interface ProductDetailModalProps {
  product: Product
  shop: Shop
  onClose: () => void
}

export function ProductDetailModal({ product, shop, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    if (product.inStock) {
      addItem(product, shop)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] bg-card rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-card border-b border-border">
          <h2 className="text-lg font-bold text-card-foreground">Product Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="aspect-video w-full overflow-hidden">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-card-foreground">{product.name}</h3>
                <p className="text-muted-foreground">from {shop.name}</p>
              </div>
              <span className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="space-y-2">
              <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product Details
              </h4>
              <ul className="space-y-2">
                {product.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 py-3 border-t border-border">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
                {product.category}
              </span>
              <span
                className={`flex items-center gap-1 text-sm ${product.inStock ? "text-primary" : "text-destructive"}`}
              >
                {product.inStock ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 bg-card border-t border-border">
          <Button onClick={handleAddToCart} disabled={!product.inStock} className="w-full h-12 text-base font-semibold">
            <ShoppingCart className="w-5 h-5 mr-2" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  )
}
