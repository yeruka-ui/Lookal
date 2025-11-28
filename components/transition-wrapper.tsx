// yeruka-ui/lookal/klyde2/components/transition-wrapper.tsx

"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import React from 'react'

const variants = {
  // FIX: Setting the initial x value to 0 prevents the double slide-in animation 
  // on page load, relying only on the opacity change and exit transition.
  initial: { opacity: 0, x: 0 }, 
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }, 
}

export function TransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}