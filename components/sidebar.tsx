"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  onAddClick: () => void
  sortBy: "price-high" | "price-low" | "stock" | "date"
  onSortChange: (sort: "price-high" | "price-low" | "stock" | "date") => void
}

export function Sidebar({ onAddClick, sortBy, onSortChange }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border p-6 overflow-y-auto">
      {/* Store Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-sidebar-foreground mb-2">TechStore</h2>
        <p className="text-sm text-sidebar-foreground/70">Premium electronics and accessories</p>
      </div>

      {/* Control Panel */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-4">
          Inventory Controls
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-sidebar-foreground/70 block mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="w-full px-3 py-2 rounded-md bg-sidebar-accent text-sidebar-accent-foreground text-sm border border-sidebar-border focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
            >
              <option value="date">Date Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Stock Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="mt-auto">
        <Button
          onClick={onAddClick}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-full py-6 gap-2 flex items-center justify-center"
          size="lg"
        >
          <Plus className="w-6 h-6" />
          <span>Add Product</span>
        </Button>
      </div>
    </aside>
  )
}
