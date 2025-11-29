import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { MainLayoutWrapper } from "@/components/main-layout-wrapper"
import { UIProvider } from "@/lib/ui-context"
import { SocketProvider } from "@/lib/socket-context"
import { Toaster } from "@/components/ui/toaster" // Import Toaster
import { NotificationListener } from "@/components/notification-listener" // Import Listener

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

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
        <SocketProvider>
        <SocketProvider>
          <CartProvider>
            <UIProvider>
              {/* These two components enable the notification system globally */}
              <NotificationListener /> 
              <MainLayoutWrapper>
                {children}
              </MainLayoutWrapper>
              <Toaster />
            </UIProvider>
          </CartProvider>
        </SocketProvider>
        </SocketProvider>
        <Analytics />
      </body>
    </html>
  )
}