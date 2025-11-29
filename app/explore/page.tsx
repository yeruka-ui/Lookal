// yeruka-ui/lookal/klyde2/app/explore/page.tsx

"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { CartProvider, useCart } from "@/lib/cart-context"
import { shops, type Shop, type Product } from "@/lib/mock-data"
import { ProductSwiper } from "@/components/product-swiper"
import { CartSheet } from "@/components/cart-sheet"
import { CheckoutModal } from "@/components/checkout-modal"
import { ShoppingCart, Star, MapPin, X, Eye, MessageCircle, ChevronUp, BadgeCheck, Store } from "lucide-react"

// Tent color schemes
const tentColorSchemes = [
    { primary: "#166534", secondary: "#f0fdf4" }, // Green & Light Green
    { primary: "#991b1b", secondary: "#fef2f2" }, // Red & Light Red
    { primary: "#1e40af", secondary: "#eff6ff" }, // Blue & Light Blue
    { primary: "#7c2d12", secondary: "#fff7ed" }, // Orange & Light Orange
    { primary: "#581c87", secondary: "#faf5ff" }, // Purple & Light Purple
    { primary: "#be123c", secondary: "#fff1f2" }, // Pink & Light Pink
]

// Renamed from TentPage to ShopExploreView for clarity
function ShopExploreView() {
    const [cartOpen, setCartOpen] = useState(false)
    const [checkoutOpen, setCheckoutOpen] = useState(false)
    const [shopQueue, setShopQueue] = useState<Shop[]>([])
    const [currentShop, setCurrentShop] = useState<Shop | null>(null)
    const [viewingProducts, setViewingProducts] = useState(false)
    const [isZooming, setIsZooming] = useState(false)
    const [swipeOffset, setSwipeOffset] = useState(0)
    // Removed verticalOffset state usage for exit
    const [isDragging, setIsDragging] = useState(false)
    const [tentColorIndex, setTentColorIndex] = useState(0)
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [bounceEffect, setBounceEffect] = useState(0)

    const { totalItems } = useCart()

    // Swipe & Scroll refs
    const touchStartX = useRef(0)
    const touchStartY = useRef(0)
    const contentRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    const shuffleShops = useCallback(() => {
        const shuffled = [...shops].sort(() => Math.random() - 0.5)
        setShopQueue(shuffled.slice(1))
        setCurrentShop(shuffled[0])

        // Create enough items to force scroll
        if (shuffled[0]) {
            const baseProducts = shuffled[0].products
            const filledProducts = Array(6).fill(baseProducts).flat()
            setDisplayedProducts(filledProducts)
        }

        setViewingProducts(false)
        setIsZooming(false)
    }, [])

    useEffect(() => {
        shuffleShops()
    }, [shuffleShops])

    // Update displayed products when current shop changes
    useEffect(() => {
        if (currentShop) {
            const baseProducts = currentShop.products
            const filledProducts = Array(6).fill(baseProducts).flat()
            setDisplayedProducts(filledProducts)
        }
    }, [currentShop])

    // Infinite Scroll Logic 
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore && currentShop) {
                    loadMoreProducts()
                }
            },
            { threshold: 0.1 }
        )

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current)
        }

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current)
            }
        }
    }, [isLoadingMore, currentShop])


    const handleNextShop = () => {
        const exitX = swipeOffset < 0 ? -500 : swipeOffset > 0 ? 500 : 0
        
        setSwipeOffset(exitX)
        setTentColorIndex((prev) => (prev + 1) % tentColorSchemes.length)

        setTimeout(() => {
            if (shopQueue.length > 0) {
                setCurrentShop(shopQueue[0])
                setShopQueue((prev) => prev.slice(1))
            } else {
                setCurrentShop(null)
            }
            setSwipeOffset(0)
            if (scrollRef.current) scrollRef.current.scrollTop = 0
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
    }

    const handleCheckout = () => {
        setCartOpen(false)
        setCheckoutOpen(true)
    }

    const handleHaggle = (e: React.MouseEvent, productName: string) => {
        e.stopPropagation()
        const message = `Hi ${currentShop?.name}, I'm interested in the ${productName}...`
        alert(`Starting Chat: "${message}"`)
    }

    // --- Gestures ---
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

        handleDragMove(diffX, diffY, e)
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
        handleDragEnd()
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        touchStartX.current = e.clientX
        touchStartY.current = e.clientY
        setIsDragging(true)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        const diffX = e.clientX - touchStartX.current
        const diffY = e.clientY - touchStartY.current
        handleDragMove(diffX, diffY, e)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
        handleDragEnd()
    }

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false)
            handleDragEnd()
        }
    }

    const handleDragMove = (diffX: number, diffY: number, e: React.SyntheticEvent) => {
        // Only allow horizontal swipes for navigation
        if (Math.abs(diffX) > Math.abs(diffY)) {
            setSwipeOffset(diffX)
        } 
        // Logic for vertical swipe (exit) has been removed as requested
    }

    const handleDragEnd = () => {
        const threshold = 100

        // Only handle horizontal swipes
        if (swipeOffset < -threshold) {
            handleNextShop()
        } else if (swipeOffset > threshold) {
            setTentColorIndex((prev) => (prev + 1) % tentColorSchemes.length)
            setSwipeOffset(0)
            handleViewProducts()
        } else {
            setSwipeOffset(0)
            setBounceEffect(0)
        }
    }

    const loadMoreProducts = () => {
        if (!currentShop || isLoadingMore) return
        setIsLoadingMore(true)
        setTimeout(() => {
            const shuffledProducts = [...currentShop.products].sort(() => Math.random() - 0.5)
            setDisplayedProducts(prev => [...prev, ...shuffledProducts])
            setIsLoadingMore(false)
        }, 500)
    }

    const getHeightClass = (index: number) => {
        const heights = [
            "row-span-2", "row-span-1", "row-span-3",
            "row-span-1", "row-span-2", "row-span-1"
        ]
        return heights[index % heights.length]
    }

    // Level 2: Product View
    if (viewingProducts && currentShop) {
        return (
            <>
                <ProductSwiper shop={currentShop} onBack={handleBackToShops} />
                <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
                <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
            </>
        )
    }

    // Empty State
    if (!currentShop) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                    <Store className="w-10 h-10 text-muted-foreground" />
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
    const currentColors = tentColorSchemes[tentColorIndex]

    return (
        <div
            className={`min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-sky-100 to-green-50 transition-all duration-500 ease-out ${isZooming ? "scale-[2] opacity-0" : "opacity-100"
                }`}
        >
            {/* Top Right "Loot Bag" Button (Fixed) */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={() => setCartOpen(true)}
                    className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-amber-700"
                >
                    <ShoppingCart className="w-6 h-6" />
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {totalItems > 9 ? "9+" : totalItems}
                        </span>
                    )}
                </button>
            </div>

            {/* Main Swipeable Container */}
            <div
                ref={contentRef}
                className="flex-1 flex flex-col relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: `translateX(${swipeOffset}px) scale(${1 - bounceEffect * 0.05})`,
                    opacity: isDragging ? opacity : 1,
                    transitionDuration: isDragging ? "0ms" : "300ms",
                }}
            >
                {/* 3D Roof Section */}
                <div className="relative z-10 w-full perspective-[1000px] shrink-0">
                    <div
                        className="transform-style-3d rotate-x-12 origin-bottom transition-transform duration-300"
                        style={{ transform: "rotateX(10deg) scale(1.05)" }}
                    >
                        <svg viewBox="0 0 400 100" className="w-full h-[100px] drop-shadow-2xl" preserveAspectRatio="none">
                            <defs>
                                <pattern id="tentStripes" patternUnits="userSpaceOnUse" width="40" height="100">
                                    <rect width="20" height="100" fill={currentColors.primary} />
                                    <rect x="20" width="20" height="100" fill={currentColors.secondary} />
                                </pattern>
                                <linearGradient id="canopyShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                                    <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,0 L400,0 L400,80 Q390,95 380,80 Q370,95 360,80 Q350,95 340,80 Q330,95 320,80 Q310,95 300,80 Q290,95 280,80 Q270,95 260,80 Q250,95 240,80 Q230,95 220,80 Q210,95 200,80 Q190,95 180,80 Q170,95 160,80 Q150,95 140,80 Q130,95 120,80 Q110,95 100,80 Q90,95 80,80 Q70,95 60,80 Q50,95 40,80 Q30,95 20,80 L0,80 L0,0 Z"
                                fill="url(#tentStripes)"
                            />
                            <path d="M20,10 L380,10 L400,80 L0,80 Z" fill="url(#canopyShadow)" className="opacity-30" />
                        </svg>
                    </div>
                </div>

                {/* Stall Body & Scrollable Product Grid */}
                <div
                    ref={scrollRef}
                    className="flex-1 w-full shadow-2xl backdrop-blur-sm -mt-6 pt-8 pb-32 px-2 md:px-96 border-x-8 overflow-y-auto no-scrollbar scroll-smooth"
                    style={{
                        backgroundColor: currentColors.secondary,
                        borderColor: `${currentColors.primary}33`
                    }}
                >
                    {/* Masonry Grid */}
                    <div className="grid grid-cols-3 auto-rows-[100px] gap-2 grid-flow-dense pb-24">
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

                                <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                    ${product.price.toFixed(0)}
                                </div>

                                <button
                                    onClick={(e) => handleHaggle(e, product.name)}
                                    className="absolute top-1 right-1 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                >
                                    <MessageCircle className="w-4 h-4 text-primary fill-primary/10" />
                                </button>

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 pointer-events-none">
                                    <span className="text-xs text-white font-bold text-center leading-tight drop-shadow-md">{product.name}</span>
                                </div>
                            </div>
                        ))}

                        {/* Infinite Scroll Loader */}
                        <div ref={loadMoreRef} className="col-span-3 flex justify-center py-8 min-h-[60px]">
                            <div className={`transition-opacity duration-300 ${isLoadingMore ? 'opacity-100' : 'opacity-0'}`}>
                                <ChevronUp className="w-6 h-6 animate-spin text-foreground/50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Swipe Indicators */}
            <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${swipeOffset < -30 ? "opacity-100 scale-110" : "opacity-0 scale-90"}`}>
                <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl ring-4 ring-red-200">
                    <X className="w-8 h-8" />
                </div>
                <p className="text-red-600 font-bold text-center mt-2 bg-white/80 px-2 rounded-full backdrop-blur-sm">SKIP</p>
            </div>
            <div className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${swipeOffset > 30 ? "opacity-100 scale-110" : "opacity-0 scale-90"}`}>
                <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center shadow-2xl ring-4 ring-green-200">
                    <Eye className="w-8 h-8" />
                </div>
                <p className="text-green-700 font-bold text-center mt-2 bg-white/80 px-2 rounded-full backdrop-blur-sm">VIEW</p>
            </div>
            {/* Removed EXIT arrow indicator */}


            {/* Bumble/Tinder Style Info Overlay (Fixed Bottom) - Lighter Dynamic Gradient */}
            <div
                className="fixed bottom-0 left-0 right-0 z-40 pt-32 pb-28 px-6 text-white pointer-events-none transition-opacity duration-300 ease-out"
                style={{
                    background: `linear-gradient(to top, ${currentColors.primary}D9 0%, ${currentColors.primary}99 50%, transparent 100%)`,
                    opacity: 1
                }}
            >
                <div className="flex flex-col gap-2">
                    <div className="flex items-end justify-between">
                        <h2 className="text-4xl font-black tracking-tighter leading-none drop-shadow-lg shadow-black">
                            {currentShop.name}
                        </h2>
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-bold text-lg">{currentShop.rating}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm font-medium mt-1">
                        <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-white shadow-sm border border-white/10">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            {currentShop.owner}
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white border border-white/20">
                            <MapPin className="w-3.5 h-3.5" />
                            {currentShop.location}
                        </span>
                    </div>

                    <p className="text-sm text-white/90 leading-relaxed line-clamp-2 mt-1 font-medium drop-shadow-sm max-w-[90%]">
                        {currentShop.description}
                    </p>
                </div>
            </div>

            {/* Cart & Checkout */}
            <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
            <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
        </div>
    )
}

export default function ExplorePage() {
    return (
        <CartProvider>
            <ShopExploreView />
        </CartProvider>
    )
}