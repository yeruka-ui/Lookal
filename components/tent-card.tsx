import type { Shop } from "@/lib/mock-data"
import { Star, MapPin, BadgeCheck } from "lucide-react"

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
    <div className="relative w-full h-[75vh] md:h-[600px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-border/50 select-none">
      
      {/* Tent Canopy Visual (Subtle Top Detail) */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="w-full h-8 drop-shadow-md">
          <defs>
            <pattern id="tentStripes" patternUnits="userSpaceOnUse" width="40" height="40">
              <rect width="20" height="40" fill="#166534" />
              <rect x="20" width="20" height="40" fill="#f0fdf4" />
            </pattern>
          </defs>
          <path
            d="M0,0 L400,0 L400,20 Q390,35 380,20 Q370,35 360,20 Q350,35 340,20 Q330,35 320,20 Q310,35 300,20 Q290,35 280,20 Q270,35 260,20 Q250,35 240,20 Q230,35 220,20 Q210,35 200,20 Q190,35 180,20 Q170,35 160,20 Q150,35 140,20 Q130,35 120,20 Q110,35 100,20 Q90,35 80,20 Q70,35 60,20 Q50,35 40,20 Q30,35 20,20 L0,20 Z"
            fill="url(#tentStripes)"
          />
        </svg>
      </div>

      {/* Main Content Area - Masonry Grid of Products */}
      <div className="h-full overflow-hidden bg-gray-50 pt-8 pb-32 px-2">
        <div className="grid grid-cols-3 auto-rows-[80px] gap-2">
          {shop.products.slice(0, 9).map((product, index) => (
            <div
              key={product.id}
              className={`${getSizeClass(index)} relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100`}
            >
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bumble/Tinder Style Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-24 pb-6 px-6 text-white">
        <div className="flex items-end justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-black tracking-tight leading-none mb-2 truncate">
              {shop.name}
            </h2>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-semibold">
                <BadgeCheck className="w-3 h-3 text-blue-400 fill-blue-400/20" />
                {shop.owner}
              </span>
              <span className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-black">
                <Star className="w-3 h-3 fill-black text-black" />
                {shop.rating}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-200/90">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{shop.location} • {shop.category}</span>
            </div>
            
            <p className="mt-3 text-sm text-gray-300 line-clamp-2 leading-relaxed opacity-90">
              {shop.description}
            </p>
          </div>
        </div>
        
        {/* Helper text */}
        <div className="absolute bottom-2 right-4 text-[10px] text-white/40 font-medium">
          Tap "View" to enter shop
        </div>
      </div>
    </div>
  )
}