"use client"

import { useParams, useRouter } from "next/navigation"
import { shops, type Product, type Shop } from "@/lib/mock-data"
import { ArrowLeft, Star, MapPin, ShoppingCart, Check, Package, User } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useState } from "react"

export default function ProductPage() {
    const params = useParams()
    const router = useRouter()
    const { addItem } = useCart()
    const [added, setAdded] = useState(false)

    const productId = params.id as string

    // Find product and shop
    let product: Product | undefined
    let shop: Shop | undefined

    for (const s of shops) {
        const p = s.products.find(p => p.id === productId)
        if (p) {
            product = p
            shop = s
            break
        }
    }

    if (!product || !shop) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Product not found</h2>
                <button onClick={() => router.back()} className="text-primary hover:underline">
                    Go back
                </button>
            </div>
        )
    }

    const handleAddToCart = () => {
        if (product && shop) {
            addItem(product, shop)
            setAdded(true)
            setTimeout(() => setAdded(false), 2000)
        }
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center gap-4 px-32 py-4 bg-background/80 backdrop-blur-md border-b border-border">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-lg truncate flex-1">{product.name}</h1>
            </div>

            {/* Image */}
            {/* Image */}
            <div className="px-48 w-full">
                <div className="h-72 w-full bg-secondary relative rounded-2xl overflow-hidden">
                    <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
                    {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">Out of Stock</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-32 py-6 space-y-8">
                {/* Title & Price */}
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-black text-foreground leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2.5 py-1 rounded-full bg-secondary text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                {product.category}
                            </span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-3xl font-black text-primary">${product.price.toFixed(2)}</div>
                        {product.inStock ? (
                            <div className="text-xs font-bold text-green-600 flex items-center justify-end gap-1 mt-1">
                                <Check className="w-3 h-3" /> In Stock
                            </div>
                        ) : (
                            <div className="text-xs font-bold text-red-500 mt-1">Out of Stock</div>
                        )}
                    </div>
                </div>

                {/* Shop Info */}
                <div className="bg-secondary/30 rounded-2xl p-4 flex items-center gap-4 border border-border/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{shop.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">Owned by {shop.owner}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 font-bold text-sm justify-end">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            {shop.rating}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{shop.reviewCount} reviews</p>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="font-bold text-lg mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                {/* Details */}
                <div>
                    <h3 className="font-bold text-lg mb-3">Details</h3>
                    <ul className="space-y-3">
                        {product.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <span className="leading-relaxed">{detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Reviews (Mock) */}
                <div>
                    <h3 className="font-bold text-lg mb-4">Reviews</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm">Happy Customer</span>
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">Great product! Exactly as described and fast shipping from {shop?.name}.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 px-32 py-4 bg-background/80 backdrop-blur-xl border-t border-border z-20">
                <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${added ? "bg-green-600 text-white" : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                >
                    {added ? (
                        <>
                            <Check className="w-6 h-6" /> Added to Cart
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="w-6 h-6" /> Add to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
