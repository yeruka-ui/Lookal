"use client"

import Link from "next/link"

interface OrderStatusCardProps {
  pendingCount: number
}

export function OrderStatusCard({ pendingCount }: OrderStatusCardProps) {
  return (
    <Link href="/pending-orders">
      <div className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer">
        <p className="text-sm font-semibold text-primary-foreground">{pendingCount} Pending</p>
      </div>
    </Link>
  )
}
