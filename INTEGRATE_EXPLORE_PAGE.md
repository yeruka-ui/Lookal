# Explore Page Supabase Integration - Manual Edit Instructions

## What this does:
Makes your Supabase store appear in the explore page (tent/swiper view), just like it already appears on the home page.

## Edit Instructions for app/explore/page.tsx:

### 1. Add imports (after line 12):
After the lucide-react import line, add these two lines:

```typescript
import { getProductsInStock } from "@/lib/supabase/products"
import { createShopFromSupabaseProducts, getStoreName } from "@/lib/product-adapter"
```

### 2. Add state variables (after line 40):  
After `const { totalItems } = useCart()` add these two lines:

```typescript
const [allShops, setAllShops] = useState<Shop[]>(shops)
const [isLoadingShops, setIsLoadingShops] = useState(true)
```

### 3. Replace the shuffleShops section (lines 49-67):
DELETE lines 49-67 (from `const shuffleShops` to  the closing of  `}, [shuffleShops])`)

REPLACE with this complete block:

```typescript
// Fetch Supabase products on mount
useEffect(() => {
    async function fetchSupabaseProducts() {
        try {
            setIsLoadingShops(true)
            const supabaseProducts = await getProductsInStock()
            
            if (supabaseProducts.length > 0) {
                const supabaseShop = createShopFromSupabaseProducts(supabaseProducts, getStoreName())
                setAllShops([supabaseShop, ...shops])
            } else {
                setAllShops(shops)
            }
        } catch (error) {
            console.error('Error fetching Supabase products:', error)
            setAllShops(shops)
        } finally {
            setIsLoadingShops(false)
        }
    }

    fetchSupabaseProducts()
}, [])

const shuffleShops = useCallback(() => {
    const shuffled = [...allShops].sort(() => Math.random() - 0.5)
    setShopQueue(shuffled.slice(1))
    setCurrentShop(shuffled[0])

    // Create enough items to force scroll
    if (shuffled[0]) {
        const baseProducts = shuffled[0].products
        const filledProducts = Array(6).fill(baseProducts).flat()
        setDisplayedProducts(filledProducts)
    }

    setViewingProducts(false)
    setIsZooming(false)
}, [allShops])

useEffect(() => {
    if (!isLoadingShops) {
        shuffleShops()
    }
}, [isLoadingShops, shuffleShops])
```

## Key Changes:
1. **Line 37**: Changed `[...shops]` to `[...allShops]` - uses combined shops instead of just mock data
2. **Line 50**: Changed `}, [])` to `}, [allShops])` - dependency on allShops
3. **Lines 52-55**: Added condition to wait for shops to load before shuffling

That's it! Your Supabase store will now appear in the explore page swiper.
