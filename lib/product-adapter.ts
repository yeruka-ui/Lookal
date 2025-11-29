import type { Product as SupabaseProduct } from './supabase/types'
import type { Product as MockProduct, Shop } from './mock-data'

/**
 * Convert a Supabase product to the format expected by UI components
 */
export function supabaseProductToMockProduct(product: SupabaseProduct, shopId: string = 'supabase-store'): MockProduct {
    return {
        id: product.id,
        shopId: shopId,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        category: 'General', // Default category since Supabase doesn't have this field
        inStock: product.stock > 0,
        details: [
            `Stock: ${product.stock} available`,
            'Verified seller',
            'Local product'
        ],
        size: 'medium' as const
    }
}

/**
 * Convert an array of Supabase products to a Shop structure
 */
export function createShopFromSupabaseProducts(products: SupabaseProduct[], shopName: string = 'Lookal Store'): Shop {
    return {
        id: 'supabase-store',
        name: shopName,
        owner: 'Local Seller',
        description: 'Discover amazing local products from our community sellers',
        category: 'Local Marketplace',
        image: '/diverse-products-still-life.png',
        rating: 4.8,
        reviewCount: 150,
        location: 'Local Market',
        products: products.map(p => supabaseProductToMockProduct(p, 'supabase-store'))
    }
}

/**
 * Get default store name from environment or use fallback
 */
export function getStoreName(): string {
    return process.env.NEXT_PUBLIC_STORE_NAME || 'Lookal Store'
}
