import type { Product as MockProduct } from "@/lib/mock-data"
import type { Product as SupabaseProduct } from "@/lib/supabase/types"
import { Check, X } from "lucide-react"

// Union type to support both product formats
type ProductType = MockProduct | (SupabaseProduct & { shopId?: string; category?: string; inStock?: boolean; details?: string[]; size?: string })

interface ProductCardProps {
  product: ProductType
  shopName: string
}

export function ProductCard({ product, shopName }: ProductCardProps) {
  // Check if product is in stock - support both formats
  const isInStock = 'inStock' in product ? product.inStock : ('stock' in product ? product.stock > 0 : true)
  const category = product.category || 'General'
  
  return (
    <div className="relative w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-border/50">
      {/* Product image */}
      <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-100">
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
        {!isInStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-500 text-white px-6 py-2 rounded-full font-bold tracking-wide shadow-lg transform -rotate-12 border-2 border-white">Out of Stock</span>
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-foreground shadow-sm">
          {category}
        </div>
      </div>

      {/* Product info */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">{product.name}</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">{shopName}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black text-green-600 tracking-tight">${product.price.toFixed(2)}</span>
            {isInStock && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">IN STOCK</span>}
          </div>
        </div>

        <p className="text-base text-gray-600 leading-relaxed font-medium">{product.description}</p>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Verified Seller</span>
          </div>
          <span>{product.id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Swipe hints overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-transparent to-green-500 opacity-20" />
    </div>
  )
}
