"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"

// Define the events we expect (matching your backend)
interface ServerToClientEvents {
  receive_trade_message: (data: { tradeId: string; senderId: string; message: string; timestamp: number }) => void
  trade_status_updated: (data: { tradeId: string; newStatus: string }) => void
}

interface ClientToServerEvents {
  send_trade_message: (data: { tradeId: string; senderId: string; recipientId: string; message: string }) => void
  update_trade_status: (data: { tradeId: string; newStatus: string; actorId: string; recipientId: string }) => void
  authenticate_user: (userId: string) => void
}

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents> | null

const SocketContext = createContext<SocketType>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<SocketType>(null)

  useEffect(() => {
    // Connect to your separate WebSocket server
    const socketInstance = io("http://localhost:3001", {
      transports: ["websocket"], // Force WebSocket to avoid polling issues
      autoConnect: true,
    })

    socketInstance.on("connect", () => {
      console.log("✅ Connected to WebSocket Server with ID:", socketInstance.id)
      
      // In a real app, you'd get this ID from your Auth system (e.g., Clerk, NextAuth)
      // For this hackathon, we'll generate a random fake User ID
      const fakeUserId = "user_" + Math.floor(Math.random() * 1000)
      socketInstance.emit("authenticate_user", fakeUserId)
    })

    socketInstance.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket Server")
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}