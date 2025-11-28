// yeruka-ui/lookal/klyde2/components/product-swiper.tsx

"use client"

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { useState } from "react"
=======
import { useState, useEffect, useCallback } from "react" 
import { useRouter } from "next/navigation" 
>>>>>>> Stashed changes
=======
import { useState, useEffect, useCallback } from "react" 
import { useRouter } from "next/navigation" 
>>>>>>> Stashed changes
=======
import { useState, useEffect, useCallback } from "react" 
import { useRouter } from "next/navigation" 
>>>>>>> Stashed changes
import type { Shop, Product } from "@/lib/mock-data"
import { useCart } from "@/lib/cart-context"
import { SwipeCard } from "./swipe-card"
import { ProductCard } from "./product-card"
import { ProductDetailModal } from "./product-detail-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Check, Package, ArrowDown, RotateCcw } from "lucide-react"
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
import { useUI } from "@/lib/ui-context" // <-- ADDED
>>>>>>> Stashed changes
=======
import { useUI } from "@/lib/ui-context" // <-- ADDED
>>>>>>> Stashed changes
=======
import { useUI } from "@/lib/ui-context" // <-- ADDED
>>>>>>> Stashed changes

interface ProductSwiperProps {
  shop: Shop
  onBack: () => void
}

interface SkippedProduct {
  product: Product;
  index: number;
}

export function ProductSwiper({ shop, onBack }: ProductSwiperProps) {
  const { addItem } = useCart()
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  
  // State for card navigation/reset
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [history, setHistory] = useState<SkippedProduct[]>([]) // History stack for skipped products
  const [resetKey, setResetKey] = useState(0); // Key to force SwipeCard component remount and reset
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  const router = useRouter() 
  const { setFullScreenMode } = useUI() // <-- NEW: Get the setter from context
  
  // State for card navigation/reset
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [history, setHistory] = useState<SkippedProduct[]>([]) 
  const [resetKey, setResetKey] = useState(0); 
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

  // State for modals and effects
  const [showDetail, setShowDetail] = useState(false)
  const [addedToCart, setAddedToCart] = useState<string | null>(null)
  
  const currentProduct = shop.products[currentProductIndex]
  const hasMoreProducts = currentProductIndex < shop.products.length
  const canBacktrack = history.length > 0;

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  // NEW: Effect to set full screen mode on mount and off on unmount
  // This controls the visibility of the global BottomNav.
  useEffect(() => {
    setFullScreenMode(true)
    return () => setFullScreenMode(false)
  }, [setFullScreenMode])

  // NEW: Consolidated exit handler that resets context and routes back to the main view.
  const handleBackToShops = useCallback(() => {
    // Navigate back to the home/main view (which will re-show the nav bar)
    router.push('/') 
  }, [router])

<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  // Function to advance the product index and handle history for skips
  const handleAdvance = (isSkip: boolean) => {
      // 1. If it's a skip, add the current product to history
      if (isSkip && currentProduct) {
          setHistory(prev => [
              ...prev, 
              { product: currentProduct, index: currentProductIndex }
          ]);
      }
      // 2. Advance the index
      setCurrentProductIndex(prev => prev + 1);
      // 3. Increment key to ensure next SwipeCard mounts fresh
      setResetKey(prev => prev + 1);
  }

  const handleSwipeLeft = () => {
    // This is the SKIP action
    handleAdvance(true);
  }

  const handleSwipeRight = () => {
    // This is the ADD action
    if (currentProduct && currentProduct.inStock) {
        addItem(currentProduct, shop)
        setAddedToCart(currentProduct.id)
        setTimeout(() => {
            setAddedToCart(null)
            handleAdvance(false);
        }, 500)
    } else {
        handleAdvance(false);
    }
  }

  const handleSwipeUp = () => {
    setShowDetail(true)
  }
  
  const handleSwipeDown = () => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    onBack()
  }

  // FIX 1: New handler to reset card animation on modal close
=======
    // Use the new exit handler which routes to the main view
    handleBackToShops() 
  }

  // Handler to reset card animation on modal close
>>>>>>> Stashed changes
  const handleCloseDetail = () => {
    setShowDetail(false);
    setResetKey(prev => prev + 1); // Force SwipeCard remount
  }

<<<<<<< Updated upstream
  // FIX 2: Undo button logic
=======
  // Undo button logic (Backtrack to last skipped product)
>>>>>>> Stashed changes
=======
    // Use the new exit handler which routes to the main view
    handleBackToShops() 
  }

  // Handler to reset card animation on modal close
  const handleCloseDetail = () => {
    setShowDetail(false);
    setResetKey(prev => prev + 1); // Force SwipeCard remount
  }

  // Undo button logic (Backtrack to last skipped product)
>>>>>>> Stashed changes
=======
    // Use the new exit handler which routes to the main view
    handleBackToShops() 
  }

  // Handler to reset card animation on modal close
  const handleCloseDetail = () => {
    setShowDetail(false);
    setResetKey(prev => prev + 1); // Force SwipeCard remount
  }

  // Undo button logic (Backtrack to last skipped product)
>>>>>>> Stashed changes
  const handleBacktrack = () => {
      if (!canBacktrack) return;
      
      const lastSkipped = history[history.length - 1];
      
      // 1. Revert index to the stored index
      setCurrentProductIndex(lastSkipped.index); 
      // 2. Remove from history
      setHistory(prev => prev.slice(0, -1));
      // 3. Force card reset
      setResetKey(prev => prev + 1);
  }

  if (!hasMoreProducts) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center bg-background rounded-3xl">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center animate-in zoom-in duration-300">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="font-bold text-2xl text-foreground">All products viewed!</h2>
          <p className="text-muted-foreground max-w-xs">
            You&apos;ve seen all products from {shop.name}.
          </p>
        </div>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        <Button onClick={onBack} className="gap-2 w-full max-w-xs" size="lg">
=======
        <Button onClick={handleBackToShops} className="gap-2 w-full max-w-xs" size="lg">
>>>>>>> Stashed changes
=======
        <Button onClick={handleBackToShops} className="gap-2 w-full max-w-xs" size="lg">
>>>>>>> Stashed changes
=======
        <Button onClick={handleBackToShops} className="gap-2 w-full max-w-xs" size="lg">
>>>>>>> Stashed changes
          <ArrowLeft className="w-4 h-4" />
          Back to Shops
        </Button>
      </div>
    )
  }

  return (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // CHANGE 1: Swapping bg-black/90 to bg-background
    <div className="fixed inset-0 flex flex-col bg-background z-50 animate-in fade-in duration-200">
      {/* Header */}
      {/* CHANGE 2: Changing header text and icon colors to foreground/dark */}
      <div className="flex items-center gap-3 p-4 pt-6 text-foreground relative z-10">
        <button
          onClick={onBack}
=======
    <div className="fixed inset-0 flex flex-col bg-background z-50 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-6 text-foreground relative z-10">
        <button
          onClick={handleBackToShops}
>>>>>>> Stashed changes
=======
    <div className="fixed inset-0 flex flex-col bg-background z-50 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-6 text-foreground relative z-10">
        <button
          onClick={handleBackToShops}
>>>>>>> Stashed changes
=======
    <div className="fixed inset-0 flex flex-col bg-background z-50 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-6 text-foreground relative z-10">
        <button
          onClick={handleBackToShops}
>>>>>>> Stashed changes
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors backdrop-blur-md text-foreground"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        {/* FIX 2: Backtrack Button */}
=======
        {/* Undo Skip Button */}
>>>>>>> Stashed changes
=======
        {/* Undo Skip Button */}
>>>>>>> Stashed changes
=======
        {/* Undo Skip Button */}
>>>>>>> Stashed changes
        {canBacktrack && (
          <button
            onClick={handleBacktrack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors backdrop-blur-md text-foreground border border-border ml-2"
            title="Undo Skip"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        <div className="flex-1 text-right pr-2">
          <h2 className="font-bold text-lg leading-tight">{shop.name}</h2>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          {/* CHANGE 3: Changing secondary text color */}
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
          <p className="text-xs text-muted-foreground">
            Product {currentProductIndex + 1} of {shop.products.length}
          </p>
        </div>
      </div>

      {/* Product card container */}
      <div className="flex-1 flex items-center justify-center p-4 relative w-full max-w-md mx-auto">
        {addedToCart === currentProduct?.id && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-green-600 text-white px-8 py-4 rounded-2xl flex flex-col items-center gap-2 shadow-2xl animate-in zoom-in duration-300">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg">Added to Cart!</span>
            </div>
          </div>
        )}

        <div className="w-full h-[65vh] md:h-[500px]">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          {/* FIX 1 & 2: Use combined key to force reset on relevant state changes */}
=======
          {/* SwipeCard is keyed to force reset on relevant state changes */}
>>>>>>> Stashed changes
=======
          {/* SwipeCard is keyed to force reset on relevant state changes */}
>>>>>>> Stashed changes
=======
          {/* SwipeCard is keyed to force reset on relevant state changes */}
>>>>>>> Stashed changes
          <SwipeCard
            key={`${currentProduct.id}-${resetKey}`} 
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
            leftLabel="SKIP"
            rightLabel="ADD"
            upLabel="INFO"
            downLabel="EXIT"
          >
            <ProductCard product={currentProduct} shopName={shop.name} />
          </SwipeCard>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pb-8 pt-2 flex flex-col items-center gap-2">
        <div className="flex justify-center gap-6">
          <button
            onClick={handleSwipeLeft}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
            // CHANGE 4: Updating button background to secondary/light
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            className="w-16 h-16 rounded-full bg-secondary border-2 border-red-500/50 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <span className="text-3xl text-red-500">✕</span>
          </button>
          
          {/* Info Button Small */}
          <button
            onClick={handleSwipeUp}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
            // CHANGE 5: Updating button background to secondary/light and text to foreground/dark
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-all mt-2 text-foreground"
          >
            <span className="text-xl">i</span>
          </button>

          <button
            onClick={handleSwipeRight}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            <ShoppingCart className="w-8 h-8 text-primary-foreground fill-primary-foreground/20" />
          </button>
        </div>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        {/* CHANGE 6: Updating footer text color */}
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        <p className="text-muted-foreground text-xs font-medium">Swipe down to exit</p>
      </div>

      {/* Product detail modal */}
      {showDetail && currentProduct && (
        <ProductDetailModal 
          product={currentProduct} 
          shop={shop} 
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          onClose={handleCloseDetail} // Use the new close handler
=======
          onClose={handleCloseDetail} 
>>>>>>> Stashed changes
=======
          onClose={handleCloseDetail} 
>>>>>>> Stashed changes
=======
          onClose={handleCloseDetail} 
>>>>>>> Stashed changes
        /> 
      )}
    </div>
  )
}