"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"

// Updated Interfaces
interface ServerToClientEvents {
  receive_trade_message: (data: any) => void
  trade_status_updated: (data: any) => void
  trade_proposed: (data: any) => void
  marketplace_history: (data: any[]) => void
  chat_history: (data: any[]) => void
  display_typing: (data: { tradeId: string; isTyping: boolean }) => void // NEW
}

interface ClientToServerEvents {
  send_trade_message: (data: { 
    tradeId: string; 
    senderId: string; 
    recipientId: string; 
    message: string; 
    attachment?: string; 
    attachmentType?: 'image' | 'video'; // NEW
    timestamp?: number 
  }) => void
  update_trade_status: (data: any) => void
  authenticate_user: (userId: string) => void
  propose_trade: (data: any) => void
  get_trades: (userId: string) => void
  get_chat_history: (tradeId: string) => void
  typing: (data: { recipientId: string; tradeId: string; isTyping: boolean }) => void // NEW
}

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents> | null

interface SocketContextValue {
    socket: SocketType;
    currentUserId: string | null;
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<SocketType>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null) 

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('test_user');
    const sessionUserId = testId || ("buyer_" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
    
    setCurrentUserId(sessionUserId)

    const socketInstance = io("http://localhost:3001", {
      transports: ["websocket"],
      autoConnect: true,
    })

    socketInstance.on("connect", () => {
      console.log(`✅ Socket Connected as: ${sessionUserId}`)
      socketInstance.emit("authenticate_user", sessionUserId)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, currentUserId }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error("useSocket must be used within a SocketProvider")
  return context
}