"use client"

import React, { createContext, useContext, useState, type ReactNode } from 'react'

interface UIContextType {
    isFullScreenMode: boolean
    setFullScreenMode: (state: boolean) => void
    isCartOpen: boolean
    setCartOpen: (state: boolean) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
    const [isFullScreenMode, setFullScreenMode] = useState(false)
    const [isCartOpen, setCartOpen] = useState(false)

    return (
        <UIContext.Provider value={{ isFullScreenMode, setFullScreenMode, isCartOpen, setCartOpen }}>
            {children}
        </UIContext.Provider>
    )
}

export function useUI() {
    const context = useContext(UIContext)
    if (!context) {
        throw new Error("useUI must be used within a UIProvider")
    }
    return context
}