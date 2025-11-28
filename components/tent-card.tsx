import type { Shop } from "@/lib/mock-data"
import { Star, MapPin } from "lucide-react"

interface TentCardProps {
  shop: Shop
}

export function TentCard({ shop }: TentCardProps) {
  // Assign different sizes to products for masonry effect
  const getSizeClass = (index: number) => {
    const sizes = [
      "col-span-2 row-span-2", // large
      "col-span-1 row-span-1", // small
      "col-span-1 row-span-2", // tall
      "col-span-1 row-span-1", // small
      "col-span-2 row-span-1", // wide
      "col-span-1 row-span-1", // small
    ]
    return sizes[index % sizes.length]
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Tent poles on sides */}
      <div className="absolute -left-3 top-8 bottom-4 w-3 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-full shadow-lg z-10" />
      <div className="absolute -right-3 top-8 bottom-4 w-3 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-full shadow-lg z-10" />

      {/* Tent canopy/awning - triangular fabric top */}
      <div className="relative z-20">
        {/* Main canopy triangle */}
        <div className="relative">
          <svg viewBox="0 0 400 80" className="w-full h-auto drop-shadow-lg">
            {/* Striped tent fabric */}
            <defs>
              <pattern id="tentStripes" patternUnits="userSpaceOnUse" width="40" height="80">
                <rect width="20" height="80" fill="#166534" />
                <rect x="20" width="20" height="80" fill="#f0fdf4" />
              </pattern>
            </defs>
            {/* Tent shape with scalloped bottom edge */}
            <path
              d="M0,80 L200,5 L400,80 L380,80 Q370,65 360,80 Q350,65 340,80 Q330,65 320,80 Q310,65 300,80 Q290,65 280,80 Q270,65 260,80 Q250,65 240,80 Q230,65 220,80 Q210,65 200,80 Q190,65 180,80 Q170,65 160,80 Q150,65 140,80 Q130,65 120,80 Q110,65 100,80 Q90,65 80,80 Q70,65 60,80 Q50,65 40,80 Q30,65 20,80 Z"
              fill="url(#tentStripes)"
            />
            {/* Tent top pole */}
            <circle cx="200" cy="5" r="8" fill="#92400e" />
          </svg>
        </div>

        {/* Shop name banner hanging from canopy */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-amber-100 border-2 border-amber-700 px-4 py-1.5 rounded shadow-md">
            <h2 className="text-sm font-bold text-amber-900 whitespace-nowrap">{shop.name}</h2>
          </div>
        </div>
      </div>

      {/* Tent body - the "stall" interior with products */}
      <div className="relative bg-gradient-to-b from-green-50 to-white border-x-4 border-b-4 border-amber-700 rounded-b-lg shadow-xl mt-0 overflow-hidden">
        {/* Wooden shelf/table effect at top */}
        <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600" />

        {/* Products masonry grid inside tent */}
        <div className="p-3 pt-6">
          <div className="grid grid-cols-3 auto-rows-[60px] gap-2">
            {shop.products.map((product, index) => (
              <div
                key={product.id}
                className={`${getSizeClass(index)} relative rounded-lg overflow-hidden bg-white border border-border shadow-sm group`}
              >
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Product price tag */}
                <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                  ${product.price.toFixed(0)}
                </div>
                {/* Product name on hover */}
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                  <span className="text-[10px] text-white font-medium text-center leading-tight">{product.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shop info footer */}
        <div className="px-3 pb-3 pt-2 border-t border-border bg-secondary/30">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{shop.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-accent text-accent" />
              <span className="font-semibold text-foreground">{shop.rating}</span>
              <span className="text-muted-foreground">({shop.reviewCount})</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
            by {shop.owner} · {shop.category}
          </p>
        </div>
      </div>

      {/* Swipe instructions at bottom */}
      <div className="flex justify-between mt-3 px-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
            ←
          </span>
          Next shop
        </span>
        <span className="flex items-center gap-1.5">
          View products
          <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            →
          </span>
        </span>
      </div>
    </div>
  )
}
