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
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <Store className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">No more shops!</h2>
          <p className="text-muted-foreground max-w-xs">
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
      <div className="flex-1 flex items-start justify-center">
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

      {/* Smaller action buttons */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 z-50">
        <button
          onClick={handleSwipeLeft}
          className="w-12 h-12 rounded-full bg-card border-2 border-destructive/30 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          aria-label="Next shop"
        >
          <span className="text-xl text-destructive">✕</span>
        </button>
        <button
          onClick={handleSwipeRight}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          aria-label="View products"
        >
          <span className="text-xl text-primary-foreground">→</span>
        </button>
      </div>
    </div>
  )
}
