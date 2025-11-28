"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { CartProvider, useCart } from "@/lib/cart-context"
import { shops, type Shop, type Product } from "@/lib/mock-data"
import { ProductSwiper } from "@/components/product-swiper"
import { CartSheet } from "@/components/cart-sheet"
import { CheckoutModal } from "@/components/checkout-modal"
import { ShoppingCart, Star, MapPin, X, Eye, MessageCircle, ChevronUp } from "lucide-react"

// Tent color schemes
const tentColorSchemes = [
  { primary: "#166534", secondary: "#f0fdf4" }, // Green & Light Green
  { primary: "#991b1b", secondary: "#fef2f2" }, // Red & Light Red
  { primary: "#1e40af", secondary: "#eff6ff" }, // Blue & Light Blue
  { primary: "#7c2d12", secondary: "#fff7ed" }, // Orange & Light Orange
  { primary: "#581c87", secondary: "#faf5ff" }, // Purple & Light Purple
  { primary: "#be123c", secondary: "#fff1f2" }, // Pink & Light Pink
]

function TentPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [shopQueue, setShopQueue] = useState<Shop[]>([])
  const [currentShop, setCurrentShop] = useState<Shop | null>(null)
  const [viewingProducts, setViewingProducts] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [tentColorIndex, setTentColorIndex] = useState(0)
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [verticalOffset, setVerticalOffset] = useState(0)
  const [bounceEffect, setBounceEffect] = useState(0)
  const { totalItems } = useCart()

  // Swipe handling
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const shuffleShops = useCallback(() => {
    const shuffled = [...shops].sort(() => Math.random() - 0.5)
    setShopQueue(shuffled.slice(1))
    setCurrentShop(shuffled[0])
    setDisplayedProducts(shuffled[0].products)
    setViewingProducts(false)
    setIsZooming(false)
  }, [])

  useEffect(() => {
    shuffleShops()
  }, [shuffleShops])

  // Update displayed products when current shop changes
  useEffect(() => {
    if (currentShop) {
      setDisplayedProducts(currentShop.products)
    }
  }, [currentShop])

  const handleNextShop = () => {
    setSwipeOffset(-500)
    // Change tent color on swipe
    setTentColorIndex((prev) => (prev + 1) % tentColorSchemes.length)
    setTimeout(() => {
      if (shopQueue.length > 0) {
        setCurrentShop(shopQueue[0])
        setShopQueue((prev) => prev.slice(1))
      } else {
        setCurrentShop(null)
      }
      setSwipeOffset(0)
    }, 300)
  }

  const handleViewProducts = () => {
    setIsZooming(true)
    setTimeout(() => {
      setViewingProducts(true)
      setIsZooming(false)
    }, 600)
  }

  const handleBackToShops = () => {
    setViewingProducts(false)
    // Fix: Do NOT skip to next shop, stay on current one
    // handleNextShop() 
  }

  const handleCheckout = () => {
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = currentX - touchStartX.current
    const diffY = currentY - touchStartY.current

    // Determine if horizontal or vertical swipe based on larger delta
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      setSwipeOffset(diffX)
      setVerticalOffset(0)
    } else {
      // Vertical swipe
      setVerticalOffset(diffY)
      setSwipeOffset(0)

      // Apply bounce effect when pulling up too hard
      if (diffY < -150) {
        const bounceIntensity = Math.min((Math.abs(diffY) - 150) / 100, 1)
        setBounceEffect(bounceIntensity)
      } else {
        setBounceEffect(0)
      }
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    const threshold = 100

    // Check vertical swipe first
    if (verticalOffset < -threshold) {
      // Swiped up - load more products
      setVerticalOffset(0)
      setBounceEffect(0)
      loadMoreProducts()
    } else if (swipeOffset < -threshold) {
      // Swiped left - next shop
      handleNextShop()
    } else if (swipeOffset > threshold) {
      // Swiped right - view products (zoom in)
      // Also change tent color on right swipe
      setTentColorIndex((prev) => (prev + 1) % tentColorSchemes.length)
      setSwipeOffset(0)
      handleViewProducts()
    } else {
      setSwipeOffset(0)
      setVerticalOffset(0)
      setBounceEffect(0)
    }
  }

  const loadMoreProducts = () => {
    if (!currentShop || isLoadingMore) return

    setIsLoadingMore(true)

    // Simulate loading delay and add shuffled products
    setTimeout(() => {
      const shuffledProducts = [...currentShop.products].sort(() => Math.random() - 0.5)
      setDisplayedProducts(prev => [...prev, ...shuffledProducts])
      setIsLoadingMore(false)
    }, 300)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewingProducts) return

      if (e.key === "ArrowLeft") {
        handleNextShop()
      } else if (e.key === "ArrowRight") {
        setTentColorIndex((prev) => (prev + 1) % tentColorSchemes.length)
        handleViewProducts()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        loadMoreProducts()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shopQueue, viewingProducts]) // Dependencies for the effect

  // Mouse handlers for desktop swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX
    touchStartY.current = e.clientY
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const diffX = e.clientX - touchStartX.current
    const diffY = e.clientY - touchStartY.current

    // Determine if horizontal or vertical based on larger delta
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setSwipeOffset(diffX)
      setVerticalOffset(0)
    } else {
      setVerticalOffset(diffY)
      setSwipeOffset(0)

      // Apply bounce effect when pulling up too hard
      if (diffY < -150) {
        const bounceIntensity = Math.min((Math.abs(diffY) - 150) / 100, 1)
        setBounceEffect(bounceIntensity)
      } else {
        setBounceEffect(0)
      }
    }
  }

  const handleMouseUp = () => {
    handleTouchEnd()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleTouchEnd()
    }
  }

  const getHeightClass = (index: number) => {
    const heights = [
      "row-span-2", // tall
      "row-span-1", // short
      "row-span-3", // extra tall
      "row-span-1", // short
      "row-span-2", // tall
      "row-span-1", // short
    ]
    return heights[index % heights.length]
  }

  // Product view mode
  if (viewingProducts && currentShop) {
    return (
      <>
        <ProductSwiper shop={currentShop} onBack={handleBackToShops} />
        <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
        <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      </>
    )
  }

  // No shops left
  if (!currentShop) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">No more shops!</h2>
          <p className="text-muted-foreground">You've explored all local shops.</p>
        </div>
        <button
          onClick={shuffleShops}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Explore Again
        </button>
      </div>
    )
  }

  const opacity = Math.max(0, 1 - Math.abs(swipeOffset) / 400)

  return (
    <div
      className={`min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-sky-100 to-green-50 transition-transform duration-500 ease-out ${isZooming ? "scale-[2] opacity-0" : "scale-100 opacity-100"
        }`}
    >
      {/* Main Swipeable Container (Roof + Stall) */}
      <div
        ref={contentRef}
        className="flex-1 flex flex-col relative cursor-grab active:cursor-grabbing select-none" // Added padding bottom for fixed navbar
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `translate(${swipeOffset}px, ${verticalOffset}px) scale(${1 - bounceEffect * 0.05})`,
          opacity: isDragging ? opacity : 1,
          transitionDuration: isDragging ? "0ms" : "300ms",
        }}
      >
        {/* 3D Roof Section */}
        <div className="relative z-10 w-full perspective-[1000px]">
          <div
            className="transform-style-3d rotate-x-12 origin-bottom transition-transform duration-300"
            style={{ transform: "rotateX(10deg) scale(1.05)" }}
          >
            <svg viewBox="0 0 400 100" className="w-full h-[100px] drop-shadow-2xl" preserveAspectRatio="none">
              <defs>
                <pattern id="tentStripes" patternUnits="userSpaceOnUse" width="40" height="100">
                  <rect width="20" height="100" fill={tentColorSchemes[tentColorIndex].primary} />
                  <rect x="20" width="20" height="100" fill={tentColorSchemes[tentColorIndex].secondary} />
                </pattern>
                <linearGradient id="canopyShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
                </linearGradient>
              </defs>
              {/* Main canopy with scalloped bottom */}
              <path
                d="M0,0 L400,0 L400,80 Q390,95 380,80 Q370,95 360,80 Q350,95 340,80 Q330,95 320,80 Q310,95 300,80 Q290,95 280,80 Q270,95 260,80 Q250,95 240,80 Q230,95 220,80 Q210,95 200,80 Q190,95 180,80 Q170,95 160,80 Q150,95 140,80 Q130,95 120,80 Q110,95 100,80 Q90,95 80,80 Q70,95 60,80 Q50,95 40,80 Q30,95 20,80 L0,80 L0,0 Z"
                fill="url(#tentStripes)"
              />
              {/* Shadow overlay for depth */}
              <path
                d="M20,10 L380,10 L400,80 L0,80 Z"
                fill="url(#canopyShadow)"
                className="opacity-30"
              />
            </svg>
            {/* Shop Sign */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-100 border-4 border-amber-800 px-6 py-2 rounded-lg shadow-xl transform translate-y-1/2">
              <h1 className="text-lg font-black text-amber-900 whitespace-nowrap tracking-wider">{currentShop.name}</h1>
            </div>
          </div>
        </div>

        {/* Stall Body & Product Grid */}
        <div
          className="flex-1 w-full shadow-2xl backdrop-blur-sm -mt-6 pt-10 pb-4 px-96 border-x-8"
          style={{
            backgroundColor: tentColorSchemes[tentColorIndex].secondary,
            borderColor: `${tentColorSchemes[tentColorIndex].primary}33` // ~20% opacity
          }}
        >

          {/* Shop Info Header */}
          <div className="mb-4 px-2 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-900/80 text-sm font-medium mb-1">
              <MapPin className="w-3 h-3" />
              <span>{currentShop.location}</span>
              <span>•</span>
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{currentShop.rating}</span>
            </div>
            <p className="text-xs text-amber-800/60 italic line-clamp-1">{currentShop.description}</p>
          </div>

          {/* Masonry Grid */}
          <div className="grid grid-cols-3 auto-rows-[100px] gap-3 grid-flow-dense">
            {displayedProducts.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className={`${getHeightClass(index)} relative border border-amber-900/10 bg-white overflow-hidden group transition-all hover:z-10 hover:shadow-lg rounded-xl`}
              >
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  draggable={false}
                />
                {/* Price tag */}
                <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  ${product.price.toFixed(0)}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 pointer-events-none">
                  <span className="text-xs text-white font-bold text-center leading-tight drop-shadow-md">{product.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Loading indicator / Swipe up hint */}
          <div className="mt-6 mb-4 flex flex-col items-center justify-center">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-amber-700">
                <ChevronUp className="w-5 h-5 animate-bounce" />
                <span className="text-sm font-medium">Loading more products...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-amber-600/60">
                <ChevronUp className="w-4 h-4 animate-bounce" />
                <span className="text-xs">Swipe up for more</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swipe Indicators (Fixed) */}
      <div
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${swipeOffset < -30 ? "opacity-100 scale-110" : "opacity-0 scale-90"}`}
      >
        <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl ring-4 ring-red-200">
          <X className="w-8 h-8" />
        </div>
        <p className="text-red-600 font-bold text-center mt-2 bg-white/80 px-2 rounded-full backdrop-blur-sm">SKIP</p>
      </div>
      <div
        className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${swipeOffset > 30 ? "opacity-100 scale-110" : "opacity-0 scale-90"}`}
      >
        <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center shadow-2xl ring-4 ring-green-200">
          <Eye className="w-8 h-8" />
        </div>
        <p className="text-green-700 font-bold text-center mt-2 bg-white/80 px-2 rounded-full backdrop-blur-sm">VIEW</p>
      </div>


      {/* Fixed Bottom Navigation Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-2 flex items-center justify-between ring-1 ring-black/5">

          <button
            onClick={handleNextShop}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
          >
            <X className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-0.5">Skip</span>
          </button>

          <button className="flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-amber-50 text-amber-600 transition-colors">
            <MessageCircle className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-0.5">Chat</span>
          </button>

          {/* Center Action Button (Cart) */}
          <div className="-mt-8">
            <button
              onClick={() => setCartOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/40 flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95 relative"
            >
              <ShoppingCart className="w-7 h-7" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center w-14 h-14 text-muted-foreground/50">
            <ChevronUp className="w-5 h-5 animate-bounce" />
          </div>

          <button
            onClick={handleViewProducts}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-green-50 text-green-600 transition-colors"
          >
            <Eye className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-0.5">View</span>
          </button>
        </div>
      </div>

      {/* Cart & Checkout */}
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  )
}

export default function Home() {
  return (
    <CartProvider>
      <TentPage />
    </CartProvider>
  )
}
