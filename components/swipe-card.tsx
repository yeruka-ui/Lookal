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
      setTimeout(onSwipeUp, 200)
    } else if (isSwipeDown && onSwipeDown && Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
      setExitDirection("down")
      setTimeout(onSwipeDown, 200)
    } else if (isSwipeLeft) {
      setExitDirection("left")
      setTimeout(onSwipeLeft, 200)
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
        setTimeout(onSwipeLeft, 200)
      } else if (e.key === "ArrowRight") {
        setExitDirection("right")
        setTimeout(onSwipeRight, 200)
      } else if (e.key === "ArrowUp" && onSwipeUp) {
        setExitDirection("up")
        setTimeout(onSwipeUp, 200)
      } else if (e.key === "ArrowDown" && onSwipeDown) {  // Changed || to &&
        setExitDirection("down")
        setTimeout(onSwipeDown, 200)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [exitDirection, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  const exitVariants = {
    left: { x: -500, opacity: 0, transition: { duration: 0.3 } },
    right: { x: 500, opacity: 0, transition: { duration: 0.3 } },
    up: { y: -500, opacity: 0, transition: { duration: 0.3 } },
    down: { y: 500, opacity: 0, transition: { duration: 0.3 } },
  }

  return (
    <div ref={constraintsRef} className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="absolute w-full cursor-grab active:cursor-grabbing"
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