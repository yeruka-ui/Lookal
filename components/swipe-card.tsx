"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"

interface SwipeCardProps {
  children: React.ReactNode
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  leftLabel?: string
  rightLabel?: string
  upLabel?: string
  downLabel?: string
}

export function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  leftLabel = "SKIP",
  rightLabel = "VIEW",
  upLabel = "DETAILS",
  downLabel = "DETAILS",
}: SwipeCardProps) {
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "up" | "down" | null>(null)
  const constraintsRef = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateZ = useTransform(x, [-200, 200], [-15, 15])
  const opacityLeft = useTransform(x, [-150, -50, 0], [1, 0.5, 0])
  const opacityRight = useTransform(x, [0, 50, 150], [0, 0.5, 1])
  const opacityUp = useTransform(y, [-150, -50, 0], [1, 0.5, 0])
  const opacityDown = useTransform(y, [0, 50, 150], [0, 0.5, 1])
  const scale = useTransform([x, y], ([latestX, latestY]: number[]) => {
    const distance = Math.sqrt(latestX ** 2 + latestY ** 2)
    return Math.max(0.95, 1 - distance / 2000)
  })

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100
    const velocityThreshold = 500

    const isSwipeLeft = info.offset.x < -threshold || info.velocity.x < -velocityThreshold
    const isSwipeRight = info.offset.x > threshold || info.velocity.x > velocityThreshold
    const isSwipeUp = info.offset.y < -threshold || info.velocity.y < -velocityThreshold
    const isSwipeDown = info.offset.y > threshold || info.velocity.y > velocityThreshold

    if (isSwipeUp && onSwipeUp && Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
      setExitDirection("up")
      setTimeout(onSwipeUp, 500)
    } else if (isSwipeDown && onSwipeDown && Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
      setExitDirection("down")
      setTimeout(onSwipeDown, 500)
    } else if (isSwipeLeft) {
      setExitDirection("left")
      setTimeout(onSwipeLeft, 500)
    } else if (isSwipeRight) {
      setExitDirection("right")
      setTimeout(onSwipeRight, 200)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (exitDirection) return

      if (e.key === "ArrowLeft") {
        setExitDirection("left")
        setTimeout(onSwipeLeft, 500)
      } else if (e.key === "ArrowRight") {
        setExitDirection("right")
        setTimeout(onSwipeRight, 500)
      } else if (e.key === "ArrowUp" && onSwipeUp) {
        setExitDirection("up")
        setTimeout(onSwipeUp, 500)
      } else if (e.key === "ArrowDown" && onSwipeDown) {
        setExitDirection("down")
        setTimeout(onSwipeDown, 500)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [exitDirection, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  const exitVariants = {
    left: { x: "-100vw", opacity: 0, rotate: -15, transition: { duration: 0.5 } },
    right: { x: "100vw", opacity: 0, rotate: 15, transition: { duration: 0.5 } },
    up: { y: "-100vh", opacity: 0, transition: { duration: 0.5 } },
    down: { y: "100vh", opacity: 0, transition: { duration: 0.5 } },
  }

  return (
    <div ref={constraintsRef} className="relative w-full h-full flex items-center justify-center">
      {/* Background Gradients */}
      <motion.div
        className="fixed inset-y-0 left-0 w-1/6 bg-gradient-to-r from-red-500/40 to-transparent pointer-events-none z-0"
        style={{ opacity: opacityLeft }}
        animate={exitDirection === "left" ? { opacity: 1 } : {}}
      />
      <motion.div
        className="fixed inset-y-0 right-0 w-1/6 bg-gradient-to-l from-green-500/40 to-transparent pointer-events-none z-0"
        style={{ opacity: opacityRight }}
        animate={exitDirection === "right" ? { opacity: 1 } : {}}
      />

      <motion.div
        className="absolute w-full cursor-grab active:cursor-grabbing z-10"
        style={{ x, y, rotateZ, scale }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        animate={exitDirection ? exitVariants[exitDirection] : {}}
        whileTap={{ scale: 0.98 }}
      >
        {/* Swipe indicators */}
        <motion.div
          className="absolute -left-4 top-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground px-3 py-2 rounded-lg font-semibold text-sm z-10"
          style={{ opacity: opacityLeft }}
        >
          {leftLabel}
        </motion.div>
        <motion.div
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-2 rounded-lg font-semibold text-sm z-10"
          style={{ opacity: opacityRight }}
        >
          {rightLabel}
        </motion.div>
        {onSwipeUp && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -top-4 bg-accent text-accent-foreground px-3 py-2 rounded-lg font-semibold text-sm z-10"
            style={{ opacity: opacityUp }}
          >
            {upLabel}
          </motion.div>
        )}
        {onSwipeDown && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -bottom-4 bg-accent text-accent-foreground px-3 py-2 rounded-lg font-semibold text-sm z-10"
            style={{ opacity: opacityDown }}
          >
            {downLabel}
          </motion.div>
        )}

        {children}
      </motion.div>
    </div>
  )
}