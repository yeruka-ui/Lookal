"use client"

import { User } from "lucide-react"

export function AccountView() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
        <User className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">My Account</h2>
      <p className="text-muted-foreground text-center mt-2">
        Sign in to save your favorite shops and track orders.
      </p>
      <button className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold">
        Sign In
      </button>
    </div>
  )
}