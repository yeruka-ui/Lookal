"use client"

import { useState, useEffect } from "react"
import { Plus, MessageCircle } from "lucide-react"
import Link from "next/link"
import { ProductGrid } from "@/components/product-grid"
import { AddProductModal } from "@/components/add-product-modal"
import { ProductDetailModal } from "@/components/product-detail-modal"
import { StoreHeader } from "@/components/store-header"
import { MiniDashboard } from "@/components/mini-dashboard"
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/supabase/products"
import { getPendingOrdersCount } from "@/lib/supabase/orders"
import type { Product } from "@/lib/supabase/types"

export default function Page() {
  const [products, setProducts] = useState<Product[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"price-high" | "price-low" | "stock" | "date">("date")
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products and pending orders count on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        const [productsData, ordersCount] = await Promise.all([
          getProducts(),
          getPendingOrdersCount(),
        ])
        setProducts(productsData)
        setPendingOrdersCount(ordersCount)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please check your connection and try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddProduct = async (newProduct: Omit<Product, "id" | "created_at" | "updated_at">) => {
    try {
      const product = await createProduct(newProduct)
      setProducts([product, ...products])
      setIsAddModalOpen(false)
    } catch (err) {
      console.error('Error adding product:', err)
      alert('Failed to add product. Please try again.')
    }
  }

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const updated = await updateProduct(updatedProduct.id, updatedProduct)
      setProducts(products.map((p) => (p.id === updated.id ? updated : p)))
      setIsDetailModalOpen(false)
    } catch (err) {
      console.error('Error updating product:', err)
      alert('Failed to update product. Please try again.')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id)
      setProducts(products.filter((p) => p.id !== id))
      setIsDetailModalOpen(false)
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('Failed to delete product. Please try again.')
    }
  }

  const getSortedProducts = () => {
    const sorted = [...products]
    switch (sortBy) {
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price)
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price)
      case "stock":
        return sorted.sort((a, b) => b.stock - a.stock)
      case "date":
      default:
        return sorted
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header - Similar to Homepage */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-8 lg:px-32 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">My Store</h1>
            <p className="text-xs text-muted-foreground font-medium">Manage your products</p>
          </div>
          <Link
            href="seller_pending_orders/"
            className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            title="Pending Orders"
          >
            <MessageCircle className="w-6 h-6 text-foreground" />
            {pendingOrdersCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mini Dashboard - Compact for Header */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-card rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Products</p>
            <p className="text-lg font-bold text-foreground">{products.length}</p>
          </div>
          <div className="bg-card rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-1">In Stock</p>
            <p className="text-lg font-bold text-green-600">{products.filter(p => p.stock > 0).length}</p>
          </div>
          <div className="bg-card rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Orders</p>
            <p className="text-lg font-bold text-primary">{pendingOrdersCount}</p>
          </div>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-foreground">Your Products</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground"
          >
            <option value="date">Newest</option>
            <option value="price-low">Price: Low</option>
            <option value="price-high">Price: High</option>
            <option value="stock">Stock</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-8 lg:px-32 py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground text-sm">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Product Grid - Consistent with Homepage */}
        {!isLoading && !error && (
          <ProductGrid
            products={getSortedProducts()}
            onProductClick={(product) => {
              setSelectedProduct(product)
              setIsDetailModalOpen(true)
            }}
          />
        )}
      </main>

      {/* Floating Action Buttons */}
      <Link
        href="seller_chat/"
        className="fixed bottom-24 right-4 md:right-6 w-12 h-12 rounded-full bg-card border-2 border-primary text-primary shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-105 z-40"
        title="Messages"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full"></span>
      </Link>

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-4 md:right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl flex items-center justify-center transition-all hover:scale-110 z-40"
        title="Add new product"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modals */}
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddProduct} />

      {selectedProduct && (
        <ProductDetailModal
          isOpen={isDetailModalOpen}
          product={selectedProduct}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdate={handleUpdateProduct}
          onDelete={handleDeleteProduct}
        />
      )}
    </div>
  )
}
