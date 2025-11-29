"use client"

import type { Product } from "@/lib/mock-data"
import { MessageCircle, Check } from "lucide-react"
import { toast } from "sonner" // Assuming sonner is installed as per components.json, or use basic alert

interface ProductCardProps {
  product: Product
  shopName: string
}

export function ProductCard({ product, shopName }: ProductCardProps) {

  const handleHaggle = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent swipe interference
    const message = `Hi ${shopName}, I'm interested in the ${product.name}. Is the price negotiable?`

    // Simulate opening a chat window
    // In a real app, this would route to /chat/[id] with a query param
    alert(`Starting Chat with ${shopName}:\n\n"${message}"`)
  }

  return (
    <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 select-none">
      {/* Product image */}
      <div className="h-full w-full relative bg-gray-100">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 pointer-events-none" />

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-500 text-white px-6 py-2 rounded-full font-bold tracking-wide shadow-lg transform -rotate-12 border-2 border-white">
              Sold Out
            </span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
          {product.category}
        </div>
      </div>

      {/* Floating "Haggle" Button (Context Aware Chat) */}
      <button
        onClick={handleHaggle}
        className="absolute top-4 right-4 z-20 w-10 h-10 bg-white text-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        title="Ask seller"
      >
        <MessageCircle className="w-5 h-5 fill-primary/10" />
      </button>

      {/* Product info - Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
        <div className="flex items-end justify-between gap-4 mb-2">
          <div className="flex-1">
            <h2 className="text-3xl font-black leading-tight tracking-tight drop-shadow-md">
              {product.name}
            </h2>
            <p className="text-sm font-medium text-gray-300 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {shopName}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-4xl font-black text-green-400 tracking-tighter drop-shadow-md">
              ${product.price.toFixed(0)}
            </span>
          </div>
        </div>

        <p className="text-base text-gray-200 leading-relaxed font-medium line-clamp-2 mb-4 opacity-90">
          {product.description}
        </p>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {product.inStock && (
            <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-md text-[10px] font-bold uppercase tracking-wider text-green-300">
              In Stock
            </span>
          )}
          <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider text-white/80">
            Verified Item
          </span>
        </div>
      </div>
    </div>
  )
}