// yeruka-ui/lookal/klyde2/app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { MainLayoutWrapper } from "@/components/main-layout-wrapper"
import { UIProvider } from "@/lib/ui-context"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LocalMart - Swipe to Shop Local",
  description: "Discover and support local entrepreneurs with a swipe",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <CartProvider>
          <UIProvider>
            <MainLayoutWrapper>
              {children}
            </MainLayoutWrapper>
          </UIProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}