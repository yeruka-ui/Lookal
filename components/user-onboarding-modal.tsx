"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { User } from "lucide-react"

export function UserOnboardingModal() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [isCertified, setIsCertified] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const storedName = localStorage.getItem("userName")
        if (!storedName) {
            setOpen(true)
        }
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim() && isCertified) {
            localStorage.setItem("userName", name.trim())
            setOpen(false)
        }
    }

    if (!mounted || !open) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

            <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Lookal!</h2>
                    <p className="text-muted-foreground mb-6">
                        Please enter your name to get started with your bartering journey.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div className="space-y-2">
                            <Label htmlFor="userName">Your Name</Label>
                            <Input
                                id="userName"
                                placeholder="e.g. Juan dela Cruz"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox
                                id="certify"
                                checked={isCertified}
                                onCheckedChange={(checked) => setIsCertified(checked as boolean)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor="certify"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground cursor-pointer"
                                >
                                    I certify that this information is correct and I am telling the truth.
                                </label>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold"
                            disabled={!name.trim() || !isCertified}
                        >
                            Start Exploring
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}