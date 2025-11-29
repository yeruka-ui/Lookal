import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

const PORT = process.env.SOCKET_PORT || 3001;

// --- 1. Define Typed Interfaces for Events ---
interface TradeProposal {
  tradeId: string;
  proposerId: string;
  shopOwnerId: string;
  items: { name: string; quantity: number }[];
  offerDetails: string;
  timestamp: number;
}

interface ServerToClientEvents {
  receive_trade_message: (data: any) => void;
  trade_status_updated: (data: any) => void;
  trade_proposed: (data: TradeProposal) => void;      // New: For Red Dot & Live Feed
  marketplace_history: (data: TradeProposal[]) => void; // New: For loading past trades
}

interface ClientToServerEvents {
  send_trade_message: (data: any) => void;
  update_trade_status: (data: any) => void;
  authenticate_user: (userId: string) => void;
  propose_trade: (data: any) => void;
  get_trades: (userId: string) => void; // New: Explicitly requesting history
}

interface InterServerEvents {}
interface SocketData {
  userId: string;
}

// --- 2. In-Memory Storage (The "Database") ---
const trades: TradeProposal[] = []; 
const usersMap = new Map<string, string>(); // Maps userId -> socketId

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  httpServer,
  {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  }
);

io.on('connection', (socket) => {
  
  // -- Auth --
  socket.on('authenticate_user', (userId: string) => {
      socket.data.userId = userId;
      usersMap.set(userId, socket.id);
      console.log(`User connected: ${userId}`);
  });

  // -- Marketplace Logic --

  // A. Save & Broadcast New Proposal
  socket.on('propose_trade', (data: any) => {
      const proposalData: TradeProposal = {
          ...data,
          timestamp: Date.now()
      };

      console.log(`📝 Saving Proposal: ${data.tradeId}`);
      trades.push(proposalData); // Save to memory

      // Notify Shop Owner (if online)
      const shopSocketId = usersMap.get(data.shopOwnerId);
      if (shopSocketId) {
          io.to(shopSocketId).emit('trade_proposed', proposalData);
      }

      // Echo back to Proposer (so they see it too)
      socket.emit('trade_proposed', proposalData);
  });

  // B. Fetch History (Fixes "Empty Marketplace" bug)
  // We accept userId explicitly here to avoid race conditions with auth
  socket.on('get_trades', (userId: string) => {
      console.log(`Fetching trades for: ${userId}`);
      // Filter trades where this user involved
      const userTrades = trades.filter(t => 
          t.proposerId === userId || t.shopOwnerId === userId
      );
      socket.emit('marketplace_history', userTrades);
  });

  // -- Chat Logic --
  socket.on('send_trade_message', (data) => {
      const messageData = { ...data, timestamp: Date.now() };
      
      const recipientSocketId = usersMap.get(data.recipientId);
      if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_trade_message', messageData);
      }
      socket.emit('receive_trade_message', messageData);
  });

  socket.on('disconnect', () => {
    if (socket.data.userId) {
      usersMap.delete(socket.data.userId);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO Marketplace Server running on port ${PORT}`);
});