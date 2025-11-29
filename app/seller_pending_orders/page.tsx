"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrders, updateOrderStatus, subscribeToOrders } from "@/lib/supabase/orders"
import type { Order } from "@/lib/supabase/types"

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch orders on mount
  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getOrders()
        setOrders(data)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to load orders. Please check your connection and try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()

    // Subscribe to real-time order updates
    const channel = subscribeToOrders((updatedOrder) => {
      setOrders((prevOrders) => {
        const exists = prevOrders.find((o) => o.id === updatedOrder.id)
        if (exists) {
          return prevOrders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        } else {
          return [updatedOrder, ...prevOrders]
        }
      })
    })

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [])

  const handleConfirmOrder = async (id: string) => {
    try {
      const updated = await updateOrderStatus(id, "confirmed")
      setOrders(orders.map((order) => (order.id === updated.id ? updated : order)))
    } catch (err) {
      console.error('Error confirming order:', err)
      alert('Failed to confirm order. Please try again.')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await updateOrderStatus(id, newStatus as 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'shipped')
      setOrders(orders.map((order) => (order.id === updated.id ? updated : order)))
    } catch (err) {
      console.error('Error updating order status:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      alert(`Failed to update order status: ${errorMessage}\n\nNote: You may need to update your database to support the new status values (preparing, on_the_way, delivered).`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "confirmed":
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "on_the_way":
        return "bg-blue-100 text-blue-800"
      case "delivered":
      case "shipped":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <Check className="w-4 h-4" />
      case "shipped":
        return <Package className="w-4 h-4" />
      default:
        return null
    }
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length

  return (
    <div className="min-h-screen bg-background dotted-bg">
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/seller_page">
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Pending Orders</h1>
            <p className="text-foreground/60 mt-1">{pendingCount} orders awaiting action</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <p className="text-foreground/60">Loading orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && (
          <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 bg-card rounded-lg border border-primary/20 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Order ID</p>
                  <p className="text-lg font-bold text-foreground">{order.order_number}</p>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium ${getStatusColor(order.status)}`}
                >
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-1">Buyer</p>
                  <p className="text-foreground font-medium">{order.buyer_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-1">Product</p>
                  <p className="text-foreground font-medium">{order.product_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-1">Quantity</p>
                  <p className="text-foreground font-medium">{order.quantity}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-primary/10">
                <p className="text-sm text-foreground/50">Ordered on {new Date(order.order_date).toLocaleDateString()}</p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-xs font-medium text-foreground/60 whitespace-nowrap">Order Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:ring-2 focus:ring-primary/20 text-sm font-medium text-foreground flex-1 sm:flex-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="on_the_way">On the Way</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <p className="text-foreground/60 text-lg">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
