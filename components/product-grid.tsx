"use client"

import type { Product } from "@/app/seller_page/page"
import { ProductCard } from "./product-card"

interface ProductGridProps {
  products: Product[]
  onProductClick: (product: Product) => void
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed border-border">
        <div className="text-center">
          <p className="text-foreground/60 font-medium">No products yet</p>
          <p className="text-foreground/40 text-sm">Add your first product to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
      ))}
    </div>
  )
}
