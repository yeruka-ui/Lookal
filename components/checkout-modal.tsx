"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useSocket } from "@/lib/socket-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Handshake, Loader2, Send } from "lucide-react"

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { socket, currentUserId } = useSocket()

  const [offerDetails, setOfferDetails] = useState("")
  const [loading, setLoading] = useState(false)

  if (!open) return null

  // Assuming items are from one shop for MVP
  const targetShop = items[0]?.shop

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !targetShop || !currentUserId) return

    setLoading(true)

    // 1. Create unique trade ID
    const tradeId = "trade_" + Date.now()

    // 2. Identify the Shop Owner's ID (Must match what Window B logs in as)
    const shopOwnerId = "shop_" + targetShop.id

    // 3. Emit the 'propose_trade' event
    socket.emit("propose_trade", {
      tradeId: tradeId,
      proposerId: currentUserId, // Buyer
      shopOwnerId: shopOwnerId,  // Seller
      items: items.map(i => ({ name: i.product.name, quantity: i.quantity })),
      offerDetails: offerDetails
    })

    // 4. UX Delay & Redirect to Marketplace
    setTimeout(() => {
      setLoading(false)
      clearCart()
      onClose()
      // Go to Marketplace to see your pending request
      router.push("/marketplace")
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            {/* CHANGED ICON & TITLE */}
            <Handshake className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Post to Marketplace</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSendProposal} className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-background">
              <img src={targetShop?.image} className="w-full h-full object-cover" alt="Shop" />
            </div>
            <div>
              {/* CHANGED TEXT: Show as a public listing targeting the shop's item */}
              <p className="text-xs text-muted-foreground">Requesting trade for item from:</p>
              <p className="font-bold text-sm">{targetShop?.name}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="offer">Your Offer</Label>
            <Textarea
              id="offer"
              placeholder="Describe what you are offering to the marketplace for this item..."
              className="min-h-[120px] bg-background"
              value={offerDetails}
              onChange={(e) => setOfferDetails(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !offerDetails.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            List Proposal
          </Button>
        </form>
      </div>
    </div>
  )
}