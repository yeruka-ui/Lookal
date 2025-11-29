"use client"

import type { Product } from "@/lib/supabase/types"
import { Package } from "lucide-react"

interface SellerProductCardProps {
  product: Product
  onClick: () => void
}

export function SellerProductCard({ product, onClick }: SellerProductCardProps) {
  const isLowStock = product.stock < 10
  const isOutOfStock = product.stock === 0

  return (
    <div
      onClick={onClick}
      className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50"
    >
      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden bg-muted relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Stock Badge */}
        {isOutOfStock ? (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold">
            Out of Stock
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            Low Stock
          </div>
        ) : (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            In Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        {/* Product Name */}
        <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Price and Stock Row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Price</span>
            <span className="text-xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Stock</span>
            <span className={`text-xl font-bold ${
              isOutOfStock ? 'text-destructive' : 
              isLowStock ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {product.stock}
            </span>
          </div>
        </div>

        {/* Description Preview */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t border-border">
            {product.description}
          </p>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}
