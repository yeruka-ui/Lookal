"use client"

import { useState, useCallback, useEffect } from "react"
import { shops, type Shop } from "@/lib/mock-data"
import { SwipeCard } from "./swipe-card"
import { TentCard } from "./tent-card"
import { ProductSwiper } from "./product-swiper"
import { RefreshCw, Store } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ShopSwiper() {
  const [shopQueue, setShopQueue] = useState<Shop[]>([])
  const [currentShop, setCurrentShop] = useState<Shop | null>(null)
  const [viewingProducts, setViewingProducts] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  const shuffleShops = useCallback(() => {
    const shuffled = [...shops].sort(() => Math.random() - 0.5)
    setShopQueue(shuffled.slice(1))
    setCurrentShop(shuffled[0])
    setViewingProducts(false)
    setSelectedShop(null)
  }, [])

  useEffect(() => {
    shuffleShops()
  }, [shuffleShops])

  const handleSwipeLeft = useCallback(() => {
    if (shopQueue.length > 0) {
      setCurrentShop(shopQueue[0])
      setShopQueue((prev) => prev.slice(1))
    } else {
      setCurrentShop(null)
    }
  }, [shopQueue])

  const handleSwipeRight = useCallback(() => {
    if (currentShop) {
      setSelectedShop(currentShop)
      setViewingProducts(true)
    }
  }, [currentShop])

  const handleBackToShops = () => {
    setViewingProducts(false)
    setSelectedShop(null)
    handleSwipeLeft()
  }

  if (viewingProducts && selectedShop) {
    return <ProductSwiper shop={selectedShop} onBack={handleBackToShops} />
  }

  if (!currentShop) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 sm:gap-6 p-4 sm:p-8 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary flex items-center justify-center">
          <Store className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
        </div>
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">No more shops!</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xs px-4">
            You&apos;ve seen all the local shops. Refresh to discover more!
          </p>
        </div>
        <Button onClick={shuffleShops} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Shops
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Card container with responsive padding */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-20 sm:pb-24">
        <SwipeCard
          key={currentShop.id}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          leftLabel="NEXT"
          rightLabel="VIEW"
        >
          <TentCard shop={currentShop} />
        </SwipeCard>
      </div>

      {/* Responsive action buttons */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-4 sm:gap-6 z-50 px-4">
        <button
          onClick={handleSwipeLeft}
          className="w-14 h-14 sm:w-16 sm:h-16 md:w-12 md:h-12 rounded-full bg-card border-2 border-destructive/30 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform touch-manipulation"
          aria-label="Next shop"
        >
          <span className="text-2xl sm:text-3xl md:text-xl text-destructive">✕</span>
        </button>
        <button
          onClick={handleSwipeRight}
          className="w-14 h-14 sm:w-16 sm:h-16 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform touch-manipulation"
          aria-label="View products"
        >
          <span className="text-2xl sm:text-3xl md:text-xl text-primary-foreground">→</span>
        </button>
      </div>
    </div>
  )
}