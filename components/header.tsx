"use client"

import { MessageCircle, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4 md:px-8">
        <h1 className="text-sm font-medium text-foreground/60">Dashboard</h1>

        <div className="flex items-center gap-4">
          {/* Chat Button */}
          <Button variant="ghost" size="icon" className="relative" title="Messages">
            <MessageCircle className="w-5 h-5 text-foreground/70" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </Button>

          {/* Order Status Button */}
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" size="sm">
            <Bell className="w-4 h-4" />
            <span>Orders</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
