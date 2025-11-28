"use client"

import { useState, useEffect } from "react"
import type { Shop } from "@/lib/mock-data"
import { useCart } from "@/lib/cart-context"
import { SwipeCard } from "./swipe-card"
import { ProductCard } from "./product-card"
import { ProductDetailModal } from "./product-detail-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Check, Package } from "lucide-react"

interface ProductSwiperProps {
  shop: Shop
  onBack: () => void
}

export function ProductSwiper({ shop, onBack }: ProductSwiperProps) {
  const [productIndex, setProductIndex] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const [addedToCart, setAddedToCart] = useState<string | null>(null)
  const { addItem } = useCart()

  const currentProduct = shop.products[productIndex]
  const hasMoreProducts = productIndex < shop.products.length

  const handleSwipeLeft = () => {
    setProductIndex((prev) => prev + 1)
  }

  const handleSwipeRight = () => {
    if (currentProduct && currentProduct.inStock) {
      addItem(currentProduct, shop)
      setAddedToCart(currentProduct.id)
      setTimeout(() => {
        setAddedToCart(null)
        setProductIndex((prev) => prev + 1)
      }, 500)
    } else {
      setProductIndex((prev) => prev + 1)
    }
  }

  const handleSwipeDown = () => {
    setShowDetail(true)
  }



  if (!hasMoreProducts) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">All products viewed!</h2>
          <p className="text-muted-foreground max-w-xs">
            You&apos;ve seen all products from {shop.name}. Browse more shops!
          </p>
        </div>
        <Button onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Shops
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-50">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-foreground">{shop.name}</h2>
          <p className="text-sm text-muted-foreground">
            Product {productIndex + 1} of {shop.products.length}
          </p>
        </div>
      </div>

      {/* Product card */}
      <div className="flex-1 flex items-center justify-center p-4 relative w-full max-w-md mx-auto">
        {addedToCart === currentProduct?.id && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-green-600 text-white px-8 py-4 rounded-2xl flex flex-col items-center gap-2 shadow-2xl animate-in zoom-in duration-300">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg">Added to cart!</span>
            </div>
          </div>
        )}

        <SwipeCard
          key={currentProduct.id}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onSwipeDown={handleSwipeDown}
          leftLabel="SKIP"
          rightLabel="ADD"
          downLabel="INFO"
        >
          <ProductCard product={currentProduct} shopName={shop.name} />
        </SwipeCard>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pb-6">
        <button
          onClick={handleSwipeLeft}
          className="w-14 h-14 rounded-full bg-card border-2 border-destructive/30 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <span className="text-2xl text-destructive">✕</span>
        </button>
        <button
          onClick={handleSwipeDown}
          className="w-12 h-12 rounded-full bg-card border-2 border-accent/30 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <span className="text-xl text-accent">↓</span>
        </button>
        <button
          onClick={handleSwipeRight}
          className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <ShoppingCart className="w-6 h-6 text-primary-foreground" />
        </button>
      </div>

      {/* Product detail modal */}
      {showDetail && currentProduct && (
        <ProductDetailModal product={currentProduct} shop={shop} onClose={() => setShowDetail(false)} />
      )}
    </div>
  )
}
