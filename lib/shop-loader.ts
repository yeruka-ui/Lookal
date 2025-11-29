import { shops, type Shop } from "@/lib/mock-data"
import { getProductsInStock } from "@/lib/supabase/products"
import { createShopFromSupabaseProducts, getStoreName } from "@/lib/product-adapter"

/**
 * Loads all shops including products from Supabase
 * Returns an array with Supabase shop first (if products exist), followed by mock shops
 */
export async function loadAllShops(): Promise<Shop[]> {
    try {
        // Fetch products from Supabase
        const supabaseProducts = await getProductsInStock()

        // If we have Supabase products, create a shop and add it first
        if (supabaseProducts.length > 0) {
            const supabaseShop = createShopFromSupabaseProducts(supabaseProducts, getStoreName())
            return [supabaseShop, ...shops]
        }

        // Otherwise just return mock shops
        return shops
    } catch (error) {
        console.error('Error loading Supabase products:', error)
        // Fallback to mock shops on error
        return shops
    }
}
