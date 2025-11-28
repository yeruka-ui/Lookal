"use client"

import type { Product } from "@/app/seller_page/page"

interface MiniDashboardProps {
  products: Product[]
  pendingOrdersCount: number
}

export function MiniDashboard({ products, pendingOrdersCount }: MiniDashboardProps) {
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0)
  const totalProducts = products.length
  const lowestStockProduct = products.length > 0 ? products.reduce((min, p) => (p.stock < min.stock ? p : min)) : null

  return (
    <div className="mt-8 p-6 bg-card rounded-lg border border-primary/20 shadow-sm">
      {/* Quick Info Header */}
      <h2 className="text-xl font-bold text-foreground mb-6">Quick Info</h2>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="p-4 bg-background rounded-lg border border-primary/10">
          <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-1">Total Products</p>
          <p className="text-3xl font-bold text-primary">{totalProducts}</p>
        </div>

        {/* Total Stock */}
        <div className="p-4 bg-background rounded-lg border border-primary/10">
          <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-1">Total Stock</p>
          <p className="text-3xl font-bold text-primary">{totalItems}</p>
        </div>

        {/* Pending Products */}
        <div className="p-4 bg-background rounded-lg border border-primary/10">
          <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-1">Pending Products</p>
          <p className="text-3xl font-bold text-primary">{pendingOrdersCount}</p>
        </div>

        {/* Lowest Stock */}
        <div className="p-4 bg-background rounded-lg border border-primary/10">
          <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-1">Lowest Stock</p>
          <p className="text-xl font-bold text-primary">
            {lowestStockProduct ? `${lowestStockProduct.name} (${lowestStockProduct.stock})` : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}
