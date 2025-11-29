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
    tags?: { tag: string; color: string }[] // Added tags to result interface
  } | null
  preferredItem?: string
  onAccept: () => void
}

export function AIResultModal({ isOpen, onClose, isLoading, result, preferredItem, onAccept }: AIResultModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl border border-border/50 w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40 bg-card/80 backdrop-blur-md z-10 shrink-0">
          <h2 className="text-2xl font-black text-primary tracking-tight flex items-center gap-2">
            ✨ AI Magic Result
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5 text-foreground/60" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
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
                  <label className="text-sm font-bold text-foreground">Product Preview</label>
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border/50 bg-secondary/30 shadow-sm">
                    <img
                      src={result.image_url}
                      alt="Product"
                      className="w-full h-full object-cover contrast-[1.08] saturate-[1.08] brightness-[1.05]" // Enhanced CSS Polish
                    />
                    {result.is_generated_image ? (
                      <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-sm">
                        ✨ AI Generated
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 bg-secondary/90 text-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-sm border border-border/50">
                        ✨ Color Enhanced
                      </div>
                    )}
                  </div>

                </div>

                {/* Text Results */}
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-bold text-foreground">Title</label>
                    <div className="p-4 bg-secondary/30 rounded-xl text-sm text-foreground border border-border/20">
                      {result.title}
                    </div>
                  </div>
                  
                  <div>
                  <label className="text-sm font-bold text-foreground">Description</label>
                  <div className="p-4 bg-secondary/30 rounded-xl text-sm text-foreground border border-border/20 italic">
                    "{result.description}"
                  </div>
                </div>

                {/* Preferred Item Display */}
                {preferredItem && (
                  <div>
                    <label className="text-sm font-bold text-foreground">Looking For</label>
                    <div className="p-4 bg-secondary/30 rounded-xl text-sm text-foreground border border-border/20 flex items-center gap-2">
                       <span className="text-primary">🔄</span> {preferredItem}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {result.tags && result.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-bold text-foreground">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.tags.map((tag: any, index: number) => {
                         // Parse color string (e.g., "zinc-600")
                         const [colorName, shade] = tag.color.split("-");
                         const bgClass = `bg-${colorName}-100`;
                         const textClass = `text-${colorName}-${shade || "800"}`;
                         const borderClass = `border-${colorName}-200`;
                         
                         const colorClass = `${bgClass} ${textClass} ${borderClass}`;

                         return (
                            <span key={index} className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
                                {tag.tag}
                            </span>
                         )
                      })}
                    </div>
                  </div>
                )}
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
            <div className="p-6 border-t border-border/40 bg-secondary/10 flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl font-bold border-border/50">
                Discard
              </Button>
              <Button onClick={onAccept} className="flex-1 gap-2 bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/25">
                <Check className="w-4 h-4" />
                Accept & Fill Form
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
