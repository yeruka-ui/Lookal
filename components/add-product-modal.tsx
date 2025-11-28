"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/supabase/types"

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: Omit<Product, "id" | "created_at" | "updated_at">) => void | Promise<void>
}

export function AddProductModal({ isOpen, onClose, onSubmit }: AddProductModalProps) {
  const [imagePreview, setImagePreview] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    image: "",
  })

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, image: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.stock) {
      alert("Please fill in all required fields")
      return
    }

    onSubmit({
      name: formData.name,
      price: Number.parseFloat(formData.price),
      description: formData.description,
      stock: Number.parseInt(formData.stock),
      image: imagePreview || "/diverse-products-still-life.png",
    })

    setFormData({ name: "", price: "", description: "", stock: "", image: "" })
    setImagePreview("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-bold text-card-foreground">Add New Product</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5 text-foreground/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Product Image</label>
            <div className="relative w-full h-40 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 cursor-pointer hover:border-accent transition-colors group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {imagePreview ? (
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-light text-foreground/40 mb-2">+</div>
                  <p className="text-sm text-foreground/60">Click to upload</p>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Product Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Row 3: Price */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Price (₱) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows={4}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Row 5: Stock Quantity */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Stock Quantity *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 font-semibold"
          >
            Add Product
          </Button>
        </form>
      </div>
    </div>
  )
}
