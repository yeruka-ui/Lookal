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
    <div className="min-h-screen bg-background dotted-bg relative">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Store Header with Description Edit and Order Status */}
        <StoreHeader pendingOrdersCount={pendingOrdersCount} />

        {/* Mini Dashboard */}
        <MiniDashboard products={products} pendingOrdersCount={pendingOrdersCount} />

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <p className="text-foreground/60">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <main className="mt-8">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your Products</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground/60">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-md bg-card border border-primary/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="date">Date Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Stock Level</option>
              </select>
            </div>
          </div>
          <ProductGrid
            products={getSortedProducts()}
            onProductClick={(product) => {
              setSelectedProduct(product)
              setIsDetailModalOpen(true)
            }}
          />
          </main>
        )}
      </div>

      <Link
        href="seller_chat/"
        className="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-card border-2 border-primary text-primary shadow-md flex items-center justify-center hover:shadow-lg transition-shadow z-40"
        title="Messages"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full"></span>
      </Link>

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110 z-40"
        title="Add new product"
      >
        <Plus className="w-7 h-7" />
      </button>

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
