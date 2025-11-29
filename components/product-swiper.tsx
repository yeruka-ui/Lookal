"use client"

import { useState } from "react"
import type { Shop } from "@/lib/mock-data"
import { useCart } from "@/lib/cart-context"
import { SwipeCard } from "./swipe-card"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check, Package, RotateCcw } from "lucide-react"

interface ProductSwiperProps {
  shop: Shop
  onBack: () => void
}

export function ProductSwiper({ shop, onBack }: ProductSwiperProps) {
  const [productIndex, setProductIndex] = useState(0)
  const [addedToCart, setAddedToCart] = useState<string | null>(null)
  const { addItem } = useCart()

  const currentProduct = shop.products[productIndex]
  const hasMoreProducts = productIndex < shop.products.length

  const totalProducts = shop.products.length;
  const progressValue = ((productIndex + 1) / totalProducts) * 100;

  const handleSwipeLeft = () => {
    setProductIndex((prev) => prev + 1)
  }

  const handleSwipeRight = () => {
    if (currentProduct && currentProduct.inStock) {
      console.log("Adding item to barter list:", currentProduct.name)
      addItem(currentProduct, shop)
      setAddedToCart(currentProduct.id)
      setTimeout(() => {
        setAddedToCart(null)
        setProductIndex((prev) => prev + 1)
      }, 300)
    } else {
      setProductIndex((prev) => prev + 1)
    }
  }

  /**
   * Implements backtrack: only undoes the last swipe (decrements index).
   * This logic ensures the button is only active after the first product.
   */
  const handleRewind = () => {
    if (productIndex > 0) {
      setProductIndex(prev => prev - 1);
      setAddedToCart(null); // Clear any visual feedback on the card
    }
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

      {/* NEW HEADER: Progress Bar and Controls (Bumble/Tinder Style) */}
      <div className="flex flex-col p-4 pb-2 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
            title="Back to shops"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 text-center">
            <h2 className="text-sm font-bold text-foreground">{shop.name}</h2>
            <p className="text-xs text-muted-foreground">Product {productIndex + 1} of {totalProducts}</p>
          </div>

          {/* Rewind Button (Backtrack for accidental skip) */}
          <button
            onClick={handleRewind}
            disabled={productIndex === 0}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-opacity ${productIndex > 0
              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
              : 'bg-secondary text-muted-foreground opacity-50 cursor-not-allowed'
              }`}
            title="Rewind (Undo Last Skip)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <Progress value={progressValue} className="h-1.5" />
      </div>

      {/* Product card */}
      <div className="flex-1 flex items-center justify-center p-0 md:p-4 relative w-full md:max-w-md mx-auto">
        {addedToCart === currentProduct?.id && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-green-600 text-white px-8 py-4 rounded-2xl flex flex-col items-center gap-2 shadow-2xl animate-in zoom-in duration-300">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg">Added to List!</span>
            </div>
          </div>
        )}

        {/* The SwipeCard component manages the swiping and calls the handlers */}
        <SwipeCard
          key={currentProduct.id}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          leftLabel="SKIP"
          rightLabel="ADD"
        >
          <ProductCard product={currentProduct} shopName={shop.name} />
        </SwipeCard>
      </div>
    </div>
  )
}