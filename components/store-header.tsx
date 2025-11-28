"use client"

import { useState } from "react"
import { Edit2, Check, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface StoreHeaderProps {
  pendingOrdersCount?: number
}

export function StoreHeader({ pendingOrdersCount = 3 }: StoreHeaderProps) {
  const [storeName] = useState("TechStore")
  const [storeDescription, setStoreDescription] = useState("Premium electronics and accessories")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState(storeDescription)

  const handleSaveDescription = () => {
    setStoreDescription(editedDescription)
    setIsEditingDescription(false)
  }

  const handleCancelEdit = () => {
    setEditedDescription(storeDescription)
    setIsEditingDescription(false)
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-primary/20">
        <div className="flex-1">
          {/* Store Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">{storeName}</h1>

          {/* Store Description with Edit */}
          <div className="flex items-start gap-3">
            {isEditingDescription ? (
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-card border border-primary/30 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveDescription} className="bg-primary hover:bg-primary/90 gap-2">
                    <Check className="w-4 h-4" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="border-primary/30 text-foreground hover:bg-primary/10 gap-2 bg-transparent"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-foreground/70 text-lg flex-1">{storeDescription}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingDescription(true)}
                  className="text-primary hover:bg-primary/10"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Link href="/seller_pending_orders">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium"
                  >
                    {pendingOrdersCount} Pending
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
