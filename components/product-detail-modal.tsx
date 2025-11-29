"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/supabase/types"

interface ProductDetailModalProps {
  isOpen: boolean
  product: Product
  onClose: () => void
  onUpdate: (product: Product) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
}

export function ProductDetailModal({ isOpen, product, onClose, onUpdate, onDelete }: ProductDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(product)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      onDelete(product.id)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-bold text-card-foreground">Product Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5 text-foreground/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isEditing ? (
            <div className="space-y-4">
              {/* Product Image */}
              <div className="w-full h-48 rounded-lg overflow-hidden bg-muted mb-4">
                <img
                  src={formData.image || "/placeholder.svg"}
                  alt={formData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div>
                <p className="text-sm text-foreground/60 mb-1">Product Name</p>
                <p className="text-lg font-semibold text-foreground">{formData.name}</p>
              </div>

              <div>
                <p className="text-sm text-foreground/60 mb-1">Price</p>
                <p className="text-2xl font-bold text-primary">${formData.price.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-sm text-foreground/60 mb-1">Stock Level</p>
                <p className="text-lg font-semibold text-foreground">{formData.stock} units</p>
              </div>

              {formData.description && (
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Description</p>
                  <p className="text-foreground">{formData.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Edit
                </Button>
                <Button onClick={handleDelete} variant="destructive" className="flex-1 gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Save
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData(product)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
