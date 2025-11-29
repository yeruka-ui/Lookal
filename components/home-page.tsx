"use client"

<<<<<<< HEAD
import { useState, useEffect } from "react"
=======
import { useState } from "react"
>>>>>>> parent of aef409a (Add DevToolbar and enhance notification handling)
import { shops, type Shop, type Product } from "@/lib/mock-data"
import { Search, ShoppingCart, MapPin, Star, Filter, ArrowRight, X, Check } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { getProductsInStock } from "@/lib/supabase/products"
import { createShopFromSupabaseProducts, getStoreName } from "@/lib/product-adapter"
import { useRouter } from "next/navigation"

interface HomePageProps {
    onNavigateToShop: (shop: Shop) => void
}

import { useUI } from "@/lib/ui-context"

export function HomePage({ onNavigateToShop }: HomePageProps) {
    const router = useRouter()
    const { setCartOpen } = useUI()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [allShops, setAllShops] = useState<Shop[]>(shops)
    const [isLoading, setIsLoading] = useState(true)
    const { totalItems } = useCart()

<<<<<<< HEAD
    // Filter States (from klyde4)
=======
    // Filter States
>>>>>>> parent of aef409a (Add DevToolbar and enhance notification handling)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [sortBy, setSortBy] = useState<"rating" | "name" | null>(null)
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

<<<<<<< HEAD
    // Fetch Supabase products on mount
    useEffect(() => {
        async function fetchSupabaseProducts() {
            try {
                setIsLoading(true)
                const supabaseProducts = await getProductsInStock()
                
                if (supabaseProducts.length > 0) {
                    const supabaseShop = createShopFromSupabaseProducts(supabaseProducts, getStoreName())
                    // Add Supabase shop at the beginning
                    setAllShops([supabaseShop, ...shops])
                } else {
                    setAllShops(shops)
                }
            } catch (error) {
                console.error('Error fetching Supabase products:', error)
                // Fallback to mock shops
                setAllShops(shops)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSupabaseProducts()
    }, [])

    // Extract all unique categories and locations
    const categories = Array.from(new Set(allShops.map((s) => s.category)))
    const locations = Array.from(new Set(allShops.map((s) => s.location)))
=======
    // Extract all unique categories and locations
    const categories = Array.from(new Set(shops.map((s) => s.category)))
    const locations = Array.from(new Set(shops.map((s) => s.location)))
>>>>>>> parent of aef409a (Add DevToolbar and enhance notification handling)

    // Filter shops based on search, category, and location
    const filteredShops = shops
        .filter((shop) => {
            const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                shop.description.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory ? shop.category === selectedCategory : true
            const matchesLocation = selectedLocation ? shop.location === selectedLocation : true
            return matchesSearch && matchesCategory && matchesLocation
        })
        .sort((a, b) => {
            if (sortBy === "rating") return b.rating - a.rating
            if (sortBy === "name") return a.name.localeCompare(b.name)
            return 0
        })

    // Get all products for the "Just For You" section
    const allProducts = shops.flatMap((shop) =>
        shop.products.map((product) => ({ ...product, shopName: shop.name, shopId: shop.id }))
    ).sort(() => Math.random() - 0.5).slice(0, 10) // Random mix

    return (
        <div className="min-h-screen bg-background pb-24 relative" onClick={() => isFilterOpen && setIsFilterOpen(false)}>
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-8 lg:px-32 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-primary tracking-tight">Lookal</h1>
                        <p className="text-xs text-muted-foreground font-medium">Discover local gems</p>
                    </div>
                    <button
                        onClick={() => setCartOpen(true)}
                        className="relative p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                        <ShoppingCart className="w-6 h-6 text-foreground" />
                        {totalItems > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative z-50">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search for artisanal goods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 text-sm font-medium"
                    />
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsFilterOpen(!isFilterOpen)
                        }}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg shadow-sm border transition-colors ${isFilterOpen || sortBy || selectedLocation
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border/50 text-muted-foreground"
                            }`}
                    >
                        <Filter className="w-3 h-3" />
                    </button>

                    {/* Filter Dropdown */}
                    {isFilterOpen && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-full right-0 mt-2 w-64 bg-card rounded-xl shadow-xl border border-border p-4 animate-in fade-in zoom-in-95 duration-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm">Filters</h3>
                                {(sortBy || selectedLocation) && (
                                    <button
                                        onClick={() => {
                                            setSortBy(null)
                                            setSelectedLocation(null)
                                        }}
                                        className="text-xs text-destructive font-medium hover:underline"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Sort By */}
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Sort By</p>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setSortBy("rating")}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === "rating" ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-foreground"
                                            }`}
                                    >
                                        <span>Highest Rated</span>
                                        {sortBy === "rating" && <Check className="w-3 h-3" />}
                                    </button>
                                    <button
                                        onClick={() => setSortBy("name")}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === "name" ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-foreground"
                                            }`}
                                    >
                                        <span>Name (A-Z)</span>
                                        {sortBy === "name" && <Check className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>

                            {/* Location Filter */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Location</p>
                                <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                    <button
                                        onClick={() => setSelectedLocation(null)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!selectedLocation ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-foreground"
                                            }`}
                                    >
                                        <span>All Locations</span>
                                        {!selectedLocation && <Check className="w-3 h-3" />}
                                    </button>
                                    {locations.map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => setSelectedLocation(loc)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedLocation === loc ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-foreground"
                                                }`}
                                        >
                                            <span className="truncate text-left">{loc}</span>
                                            {selectedLocation === loc && <Check className="w-3 h-3 shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Categories */}
            <div className="py-4 overflow-x-auto scrollbar-hide">
                <div className="flex px-4 md:px-8 lg:px-32 gap-2">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!selectedCategory
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Shops */}
            <section className="py-4">
                <div className="px-4 md:px-8 lg:px-32 flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-foreground">Trending Shops</h2>
                    <button className="text-xs font-bold text-primary flex items-center gap-1">
                        View All <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="flex overflow-x-auto px-4 md:px-8 lg:px-32 gap-4 pb-4 scrollbar-hide snap-x">
                    {filteredShops.length > 0 ? (
                        filteredShops.map((shop) => (
                            <div
                                key={shop.id}
                                onClick={() => router.push(`/shop/${shop.id}`)}
                                className="snap-center shrink-0 w-[280px] bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 group cursor-pointer hover:shadow-md transition-all"
                            >
                                <div className="h-32 overflow-hidden relative">
                                    <img
                                        src={shop.image || "/placeholder.svg"}
                                        alt={shop.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold shadow-sm">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        {shop.rating}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-foreground truncate">{shop.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{shop.location}</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        {shop.products.slice(0, 3).map((p) => (
                                            <div key={p.id} className="w-12 h-12 rounded-lg bg-secondary overflow-hidden">
                                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        {shop.products.length > 3 && (
                                            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                +{shop.products.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full py-8 text-center text-muted-foreground text-sm">
                            No shops found matching your filters.
                        </div>
                    )}
                </div>
            </section>

            {/* Fresh Arrivals (Masonry-ish) */}
            <section className="px-4 md:px-8 lg:px-32 py-4">
                <h2 className="text-lg font-bold text-foreground mb-4">Fresh Arrivals</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {allProducts.map((product, i) => (
                        <div
                            key={`${product.id}-${i}`}
                            onClick={() => router.push(`/product/${product.id}`)}
                            className="bg-card rounded-xl overflow-hidden shadow-sm border border-border/50 group cursor-pointer"
                        >
                            <div className="aspect-square overflow-hidden relative bg-secondary">
                                <img
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">
                                    Barter
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-sm text-foreground line-clamp-1">{product.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.shopName}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
