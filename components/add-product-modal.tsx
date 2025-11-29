"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { X, Sparkles, Upload, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/supabase/types"
import { AIResultModal } from "@/components/ai-result-modal"

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: Omit<Product, "id" | "created_at" | "updated_at">) => void | Promise<void>
}

export function AddProductModal({ isOpen, onClose, onSubmit }: AddProductModalProps) {
  const [step, setStep] = useState<"upload" | "form">("upload")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    image: "",
  })

  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
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

  const handleGenerateWithAI = async () => {
    if (!imageFile || !formData.name || !formData.price) {
      alert("Please upload an image and provide a name and price.")
      return
    }

    setIsAIModalOpen(true)
    setIsAILoading(true)
    setAiResult(null)

    try {
      const data = new FormData()
      data.append("data", imageFile)
      // Send placeholders if empty so the API doesn't reject it
      data.append("title", formData.name || "Untitled Product")
      data.append("price", formData.price || "0")

      const response = await fetch("/api/generate-listing", {
        method: "POST",
        body: data,
      })

      if (!response.ok) {
        throw new Error("Failed to generate listing")
      }

      const result = await response.json()
      setAiResult({
        ...result,
        description: result.ai_description // Map API field to Modal prop
      })
    } catch (error) {
      console.error("AI Generation Error:", error)
      alert("Failed to generate AI content. Please try again.")
      setIsAIModalOpen(false)
    } finally {
      setIsAILoading(false)
    }
  }

  const handleAcceptAIResult = () => {
    if (aiResult) {
      setFormData((prev) => ({
        ...prev,
        description: aiResult.ai_description,
        image: aiResult.image_url,
        name: aiResult.title !== "Untitled Product" ? aiResult.title : "",
        price: aiResult.price !== "0" ? aiResult.price : "",
      }))
      setImagePreview(aiResult.image_url)
      setStep("form")
    }
    setIsAIModalOpen(false)
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
      image: formData.image || "/diverse-products-still-life.png",
    })

    // Reset
    setFormData({ name: "", price: "", description: "", stock: "", image: "" })
    setImagePreview("")
    setImageFile(null)
    setStep("upload")
  }

  const handleClose = () => {
    setStep("upload")
    setImagePreview("")
    setImageFile(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
            <h2 className="text-xl font-bold text-card-foreground">
              {step === "upload" ? "Start with a Photo" : "Edit Product Details"}
            </h2>
            <button onClick={handleClose} className="p-1 hover:bg-muted rounded-md transition-colors">
              <X className="w-5 h-5 text-foreground/60" />
            </button>
          </div>

          {/* Step 1: Upload & AI Generation */}
          {step === "upload" && (
            <div className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Let AI Write Your Listing</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a photo and we'll generate a title, description, and enhanced image for you.
                </p>
              </div>

              <div className="relative w-full h-64 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-muted/30 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all group overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {imagePreview ? (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-foreground">Click to upload photo</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-2">Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Price (₱)</label>
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
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Quantity</label>
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
              </div>

              <Button
                onClick={handleGenerateWithAI}
                disabled={!imagePreview || !formData.name || !formData.price}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-bold shadow-lg shadow-primary/20"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Magic Listing
              </Button>
              
              <div className="text-center">
                 <button 
                    onClick={() => setStep("form")}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                 >
                    Skip AI and enter manually
                 </button>
              </div>
            </div>
          )}

          {/* Step 2: Full Form (Pre-filled) */}
          {step === "form" && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Preview (Small) */}
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                 <div className="w-16 h-16 rounded-md overflow-hidden bg-background shrink-0">
                    <img src={imagePreview || "/placeholder.svg"} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Product Image</p>
                    <button 
                        type="button" 
                        onClick={() => setStep("upload")}
                        className="text-xs text-primary font-bold hover:underline"
                    >
                        Change Photo
                    </button>
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
                Save Product
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* AI Result Modal */}
      <AIResultModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        isLoading={isAILoading}
        result={aiResult}
        onAccept={handleAcceptAIResult}
      />
    </>
  )
}
