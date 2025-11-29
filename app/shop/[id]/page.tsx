"use client"

import { useParams, useRouter } from "next/navigation"
import { shops, type Shop } from "@/lib/mock-data"
import { ArrowLeft, Star, MapPin, BadgeCheck, MessageCircle, Store } from "lucide-react"
import { useState } from "react"

export default function ShopPage() {
    const params = useParams()
    const router = useRouter()
    const shopId = params.id as string

    // Find shop
    const shop = shops.find(s => s.id === shopId)

    if (!shop) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Shop not found</h2>
                <button onClick={() => router.back()} className="text-primary hover:underline">
                    Go back
                </button>
            </div>
        )
    }

    const handleContact = () => {
        alert(`Starting chat with ${shop.owner}...`)
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header Image */}
            <div className="px-32 w-full pt-4">
                <div className="h-64 w-full relative rounded-2xl overflow-hidden">
                    <img src={shop.image || "/placeholder.svg"} alt={shop.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    <button
                        onClick={() => router.back()}
                        className="absolute top-4 left-4 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors z-10"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <h1 className="text-3xl font-black tracking-tight mb-2">{shop.name}</h1>
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span>{shop.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{shop.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-32 py-8 space-y-8">
                {/* Owner Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                            <Store className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Owned by {shop.owner}</h3>
                            <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
                                <BadgeCheck className="w-3 h-3" /> Verified Seller
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleContact}
                        className="p-3 rounded-full bg-secondary text-primary hover:bg-secondary/80 transition-colors"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* Description */}
                <div>
                    <h3 className="font-bold text-lg mb-2">About</h3>
                    <p className="text-muted-foreground leading-relaxed">{shop.description}</p>
                </div>

                {/* Products */}
                <div>
                    <h3 className="font-bold text-lg mb-4">Products ({shop.products.length})</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {shop.products.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => router.push(`/product/${product.id}`)}
                                className="bg-card rounded-xl overflow-hidden shadow-sm border border-border/50 group cursor-pointer"
                            >
                                <div className="aspect-square bg-secondary relative">
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
                                    <h4 className="font-bold text-sm text-foreground line-clamp-1">{product.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews (Mock) */}
                <div>
                    <h3 className="font-bold text-lg mb-4">Reviews ({shop.reviewCount})</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                            U{i}
                                        </div>
                                        <span className="font-bold text-sm">User {i}</span>
                                    </div>
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">Amazing shop! The products are high quality and the owner is very friendly.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
