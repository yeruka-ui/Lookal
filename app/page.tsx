// yeruka-ui/lookal/klyde2/app/page.tsx

"use client"

import { HomePage } from "@/components/home-page"

export default function Home() {
  return (
    <HomePage onNavigateToShop={() => { /* Navigation handled by BottomNav router link */}} />
  )
}