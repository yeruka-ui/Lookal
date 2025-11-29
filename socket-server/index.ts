import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config'; // Use dotenv for config

const PORT = process.env.SOCKET_PORT || 3001;

// --- Custom Type Definitions for Clarity ---

interface ServerToClientEvents {
  receive_trade_message: (data: { tradeId: string; senderId: string; message: string; timestamp: number }) => void;
  trade_status_updated: (data: { tradeId: string; newStatus: 'Proposed' | 'Counter' | 'Confirmed' | 'Rejected'; actorId: string }) => void;
  user_connected: (userId: string) => void;
}

interface ClientToServerEvents {
  send_trade_message: (data: { tradeId: string; senderId: string; recipientId: string; message: string }) => void;
  update_trade_status: (data: { tradeId: string; newStatus: 'Proposed' | 'Counter' | 'Confirmed' | 'Rejected'; actorId: string; recipientId: string }) => void;
  authenticate_user: (userId: string) => void; 
}

interface InterServerEvents {}
interface SocketData {
  userId: string;
}

// Map to store userId to socketId for direct messaging
const usersMap = new Map<string, string>(); 

// --- Server Initialization ---

const httpServer = createServer();

// Initialize the Socket.IO server
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  httpServer,
  {
    // Crucial for allowing connection from your Next.js app running on a different port (e.g., 3000)
    cors: {
      origin: '*', // For hackathon: allows any origin; tighten this in production.
      methods: ['GET', 'POST']
    }
  }
);

// --- Connection and Event Handling ---

io.on('connection', (socket) => {
  
  // 1. Authenticate and Map User to Socket ID
  socket.on('authenticate_user', (userId: string) => {
      socket.data.userId = userId;
      usersMap.set(userId, socket.id);
      console.log(`User ${userId} authenticated and mapped to ${socket.id}`);
      // In a real app, you might only emit this to the user's active devices:
      // io.emit('user_connected', userId); 
  });

  // 2. Real-Time Trade Negotiation Chat
  socket.on('send_trade_message', (data) => {
      const messageData = {
          ...data,
          timestamp: Date.now()
      };

      // Find recipient's socket ID for targeted delivery (Private Message)
      const recipientSocketId = usersMap.get(data.recipientId);

      // Emit to the recipient (other party)
      if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_trade_message', messageData);
      }
      
      // Emit back to the sender for immediate UI display (optimistic update)
      socket.emit('receive_trade_message', messageData);
  });

  // 3. Critical Trade Status Updates
  socket.on('update_trade_status', (data) => {
      // Logic: Update database entry here.

      const recipientSocketId = usersMap.get(data.recipientId);
      
      // Notify both parties of the critical status change
      if (recipientSocketId) {
          io.to(recipientSocketId).emit('trade_status_updated', data);
      }
      socket.emit('trade_status_updated', data);
  });

  // Handle Disconnection
  socket.on('disconnect', () => {
    // Clean up the user map
    if (socket.data.userId) {
      usersMap.delete(socket.data.userId);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO Server running on ws://localhost:${PORT}`);
});