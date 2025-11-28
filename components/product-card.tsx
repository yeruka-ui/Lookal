"use client"
import type { Product } from "@/lib/supabase/types"

interface ProductCardProps {
  product: Product
  onClick: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-accent transition-all duration-200"
    >
      {/* Image Container */}
      <div className="relative w-full h-40 bg-muted overflow-hidden">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground line-clamp-2 mb-2 text-sm">{product.name}</h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">₱{product.price.toFixed(2)}</span>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent/10 text-accent">
            Stock: {product.stock}
          </span>
        </div>
      </div>
    </div>
  )
}
