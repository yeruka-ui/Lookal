// yeruka-ui/lookal/klyde2/app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { MainLayoutWrapper } from "@/components/main-layout-wrapper"
import { UIProvider } from "@/lib/ui-context" // <-- ADDED
import { SocketProvider } from "@/lib/socket-context" // Import the new provider

const _dmSans = DM_Sans({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lookal",
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
        <SocketProvider> {/* <--- Add this wrapper */}
          <CartProvider>
            <UIProvider>
              <MainLayoutWrapper>
                {children}
              </MainLayoutWrapper>
            </UIProvider>
          </CartProvider>
        </SocketProvider> {/* <--- Close it here */}
        <Analytics />
      </body>
    </html>
  )
}