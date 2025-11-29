"use client"

import { X, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIResultModalProps {
  isOpen: boolean
  onClose: () => void
  isLoading: boolean
  result: {
    title: string
    price: string
    description: string
    image_url: string
    is_generated_image: boolean
    fallback_reason?: string
  } | null
  onAccept: () => void
}

export function AIResultModal({ isOpen, onClose, isLoading, result, onAccept }: AIResultModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            ✨ AI Magic Result
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5 text-foreground/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <RefreshCw className="w-10 h-10 text-primary animate-spin" />
              <p className="text-foreground/60 font-medium">Brewing magic... This takes about 10-15 seconds.</p>
              <p className="text-xs text-muted-foreground">Analyzing image • Writing copy • Generating visuals</p>
            </div>
          ) : result ? (
            <>
              {/* Image Result */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Enhanced Image</label>
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-border bg-muted/30">
                  <img
                    src={result.image_url}
                    alt="AI Generated"
                    className="w-full h-full object-cover"
                  />
                  {result.is_generated_image && (
                    <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-sm">
                      ✨ AI Generated
                    </div>
                  )}
                </div>
                {result.fallback_reason && (
                    <p className="text-xs text-amber-500 mt-1">
                        Note: Could not generate new image ({result.fallback_reason}). Using original.
                    </p>
                )}
              </div>

              {/* Text Results */}
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground">Title</label>
                  <div className="p-3 bg-muted/30 rounded-md text-sm text-foreground border border-border/50">
                    {result.title}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-foreground">Price</label>
                  <div className="p-3 bg-muted/30 rounded-md text-sm text-foreground border border-border/50">
                    ₱{result.price}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Description</label>
                  <div className="p-3 bg-muted/30 rounded-md text-sm text-foreground border border-border/50 italic">
                    "{result.description}"
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-destructive">
              Something went wrong. Please try again.
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && result && (
          <div className="p-6 border-t border-border bg-muted/10 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Discard
            </Button>
            <Button onClick={onAccept} className="flex-1 gap-2 bg-primary hover:bg-primary/90">
              <Check className="w-4 h-4" />
              Accept & Fill Form
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
