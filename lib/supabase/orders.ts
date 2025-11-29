import { supabase } from './client'
import type { Order, OrderInsert, OrderUpdate } from './types'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Fetch all orders from the database
 */
export async function getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching orders:', error)
        throw error
    }

    return data || []
}

/**
 * Get count of pending orders
 */
export async function getPendingOrdersCount(): Promise<number> {
    const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    if (error) {
        console.error('Error fetching pending orders count:', error)
        throw error
    }

    return count || 0
}

/**
 * Create a new order
 */
export async function createOrder(order: OrderInsert): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single()

    if (error) {
        console.error('Error creating order:', error)
        throw error
    }

    return data
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: string, status: 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'shipped'): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating order status:', error)
        throw error
    }

    return data
}

/**
 * Subscribe to real-time order updates
 */
export function subscribeToOrders(callback: (order: Order) => void): RealtimeChannel {
    const channel = supabase
        .channel('orders-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'orders',
            },
            (payload) => {
                if (payload.new) {
                    callback(payload.new as Order)
                }
            }
        )
        .subscribe()

    return channel
}
