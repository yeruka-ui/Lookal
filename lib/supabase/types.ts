export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string
                    name: string
                    price: number
                    image: string
                    description: string
                    stock: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    price: number
                    image: string
                    description: string
                    stock: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    price?: number
                    image?: string
                    description?: string
                    stock?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    order_number: string
                    buyer_name: string
                    product_id: string
                    product_name: string
                    quantity: number
                    price: number
                    status: 'pending' | 'confirmed' | 'shipped'
                    order_date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_number: string
                    buyer_name: string
                    product_id: string
                    product_name: string
                    quantity: number
                    price: number
                    status?: 'pending' | 'confirmed' | 'shipped'
                    order_date?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_number?: string
                    buyer_name?: string
                    product_id?: string
                    product_name?: string
                    quantity?: number
                    price?: number
                    status?: 'pending' | 'confirmed' | 'shipped'
                    order_date?: string
                    created_at?: string
                }
            }
            conversations: {
                Row: {
                    id: string
                    buyer_name: string
                    buyer_image: string
                    last_message: string
                    last_message_at: string
                    unread: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    buyer_name: string
                    buyer_image: string
                    last_message: string
                    last_message_at?: string
                    unread?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    buyer_name?: string
                    buyer_image?: string
                    last_message?: string
                    last_message_at?: string
                    unread?: boolean
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender: 'buyer' | 'seller'
                    text: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    sender: 'buyer' | 'seller'
                    text: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    sender?: 'buyer' | 'seller'
                    text?: string
                    created_at?: string
                }
            }
            store_settings: {
                Row: {
                    id: string
                    store_name: string
                    store_description: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    store_name: string
                    store_description: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    store_name?: string
                    store_description?: string
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}

// Convenience types
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

export type StoreSettings = Database['public']['Tables']['store_settings']['Row']
export type StoreSettingsInsert = Database['public']['Tables']['store_settings']['Insert']
export type StoreSettingsUpdate = Database['public']['Tables']['store_settings']['Update']
