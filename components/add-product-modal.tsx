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
    description: "",
    stock: "1", // Default to 1 for bartering
    image: "",
    tags: [] as any[], // Store tags
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
    if (!imageFile || !formData.name) {
      alert("Please upload an image and provide a name.")
      return
    }

    setIsAIModalOpen(true)
    setIsAILoading(true)
    setAiResult(null)

    try {
      const data = new FormData()
      data.append("data", imageFile)
      data.append("title", formData.name)
      // Price removed for bartering

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
        tags: aiResult.tags || [],
      }))
      setImagePreview(aiResult.image_url)
      setStep("form")
    }
    setIsAIModalOpen(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      alert("Please fill in the product name")
      return
    }

    onSubmit({
      name: formData.name,
      price: 0, // Bartering implies no currency, setting to 0
      description: formData.description,
      stock: 1, // Default to 1
      image: formData.image || "/diverse-products-still-life.png",
      // tags: formData.tags // Pass tags if the parent component accepts them
    })

    // Reset
    setFormData({ name: "", description: "", stock: "1", image: "", tags: [] })
    setImagePreview("")
    setImageFile(null)
    setStep("upload")
  }

  const handleClose = () => {
    setStep("upload")
    setImagePreview("")
    setImageFile(null)
    setFormData({ name: "", description: "", stock: "1", image: "", tags: [] })
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-3xl border border-border/50 w-full max-w-md max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/40 bg-card/80 backdrop-blur-md z-10 shrink-0">
            <h2 className="text-2xl font-black text-primary tracking-tight">
              {step === "upload" ? "Start with a Photo" : "Edit Details"}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <X className="w-5 h-5 text-foreground/60" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1">
            {/* Step 1: Upload & AI Generation */}
            {step === "upload" && (
              <div className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Let AI Write Your Listing</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo and we'll generate a title, description, and enhanced image for you.
                  </p>
                </div>

                <div className="relative w-full h-64 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center bg-secondary/30 cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-all group overflow-hidden">
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
                      <p className="text-sm font-bold text-foreground">Click to upload photo</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Product Name</label>
                      <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g. Vintage Rattan Chair"
                          className="w-full px-4 py-3 border-none rounded-xl bg-secondary/50 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateWithAI}
                  disabled={!imagePreview || !formData.name}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-bold rounded-xl shadow-lg shadow-primary/25"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Magic Listing
                </Button>
                
                <div className="text-center">
                   <button 
                      onClick={() => setStep("form")}
                      className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
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
                <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-2xl border border-border/50">
                   <div className="w-16 h-16 rounded-xl overflow-hidden bg-background shrink-0 shadow-sm">
                      <img src={imagePreview || "/placeholder.svg"} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Product Image</p>
                      <button 
                          type="button" 
                          onClick={() => setStep("upload")}
                          className="text-sm text-primary font-bold hover:underline"
                      >
                          Change Photo
                      </button>
                   </div>
                </div>

                {/* Row 2: Product Name */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 border-none rounded-xl bg-secondary/50 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                {/* Row 4: Description */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell the story of your item..."
                    rows={4}
                    className="w-full px-4 py-3 border-none rounded-xl bg-secondary/50 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  />
                </div>

                {/* Tags Display */}
                {formData.tags && formData.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag: any, index: number) => {
                         const colorMap: Record<string, string> = {
                            zinc: "bg-zinc-100 text-zinc-800 border-zinc-200",
                            amber: "bg-amber-100 text-amber-800 border-amber-200",
                            red: "bg-red-100 text-red-800 border-red-200",
                            stone: "bg-stone-100 text-stone-800 border-stone-200",
                            fuchsia: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
                            lime: "bg-lime-100 text-lime-800 border-lime-200",
                            teal: "bg-teal-100 text-teal-800 border-teal-200",
                            slate: "bg-slate-100 text-slate-800 border-slate-200",
                            violet: "bg-violet-100 text-violet-800 border-violet-200",
                            indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
                            neutral: "bg-neutral-100 text-neutral-800 border-neutral-200",
                            sky: "bg-sky-100 text-sky-800 border-sky-200",
                            orange: "bg-orange-100 text-orange-800 border-orange-200",
                            rose: "bg-rose-100 text-rose-800 border-rose-200",
                            emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
                            yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
                            cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
                            blue: "bg-blue-100 text-blue-800 border-blue-200",
                            purple: "bg-purple-100 text-purple-800 border-purple-200",
                            pink: "bg-pink-100 text-pink-800 border-pink-200",
                            green: "bg-green-100 text-green-800 border-green-200",
                            gray: "bg-gray-100 text-gray-800 border-gray-200",
                         };
                         const colorClass = colorMap[tag.color] || "bg-secondary text-foreground border-border";
                         
                         return (
                            <span key={index} className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
                                {tag.tag}
                            </span>
                         )
                      })}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 font-bold rounded-xl shadow-lg shadow-primary/25"
                >
                  Save Product
                </Button>
              </form>
            )}
          </div>
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
