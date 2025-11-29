"use client"

import { useState } from "react"
import { shops, type Shop, type Product } from "@/lib/mock-data"
import { Search, ShoppingCart, MapPin, Star, Filter, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"

interface HomePageProps {
    onNavigateToShop: (shop: Shop) => void
}

export function HomePage({ onNavigateToShop }: HomePageProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const { totalItems } = useCart()

    // Extract all unique categories
    const categories = Array.from(new Set(shops.map((s) => s.category)))

    // Filter shops based on search and category
    const filteredShops = shops.filter((shop) => {
        const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shop.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory ? shop.category === selectedCategory : true
        return matchesSearch && matchesCategory
    })

    // Get all products for the "Just For You" section
    const allProducts = shops.flatMap((shop) =>
        shop.products.map((product) => ({ ...product, shopName: shop.name, shopId: shop.id }))
    ).sort(() => Math.random() - 0.5).slice(0, 10) // Random mix

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-32 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-primary tracking-tight">Lookal</h1>
                        <p className="text-xs text-muted-foreground font-medium">Discover local gems</p>
                    </div>
                    <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
                        <ShoppingCart className="w-6 h-6 text-foreground" />
                        {totalItems > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search for artisanal goods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 text-sm font-medium"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-background shadow-sm border border-border/50 text-muted-foreground">
                        <Filter className="w-3 h-3" />
                    </button>
                </div>
            </header>

            {/* Categories */}
            <div className="py-4 overflow-x-auto scrollbar-hide">
                <div className="flex px-32 gap-2">
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
                <div className="px-32 flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-foreground">Trending Shops</h2>
                    <button className="text-xs font-bold text-primary flex items-center gap-1">
                        View All <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="flex overflow-x-auto px-32 gap-4 pb-4 scrollbar-hide snap-x">
                    {filteredShops.map((shop) => (
                        <div
                            key={shop.id}
                            onClick={() => onNavigateToShop(shop)}
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
                    ))}
                </div>
            </section>

            {/* Fresh Arrivals (Masonry-ish) */}
            <section className="px-32 py-4">
                <h2 className="text-lg font-bold text-foreground mb-4">Fresh Arrivals</h2>
                <div className="grid grid-cols-4 gap-3">
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
                                    ${product.price.toFixed(0)}
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
