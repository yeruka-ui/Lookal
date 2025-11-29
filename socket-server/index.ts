import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

const PORT = process.env.SOCKET_PORT || 3001;

// --- 1. Define Data Structures ---
interface TradeProposal {
  tradeId: string;
  proposerId: string;
  shopOwnerId: string;
  items: { name: string; quantity: number }[];
  offerDetails: string;
  timestamp: number;
}

interface ChatMessage {
  tradeId: string;
  message: string;
  senderId: string;
  recipientId: string;
  timestamp: number;
}

// --- 2. In-Memory Storage ---
const trades: TradeProposal[] = []; 
const messages: ChatMessage[] = []; // NEW: Store all chat messages here
const usersMap = new Map<string, string>(); 

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  
  // -- Auth --
  socket.on('authenticate_user', (userId: string) => {
      socket.data.userId = userId;
      usersMap.set(userId, socket.id);
      console.log(`User connected: ${userId}`);
  });

  // -- Marketplace Logic (Existing) --
  socket.on('get_trades', (userId: string) => {
      const userTrades = trades.filter(t => 
          t.proposerId === userId || t.shopOwnerId === userId
      );
      socket.emit('marketplace_history', userTrades);
  });

  socket.on('propose_trade', (data: TradeProposal) => {
      const proposalData = { ...data, timestamp: Date.now() };
      trades.push(proposalData); 

      const shopSocketId = usersMap.get(data.shopOwnerId);
      if (shopSocketId) {
          io.to(shopSocketId).emit('trade_proposed', proposalData);
      }
      socket.emit('trade_proposed', proposalData);
  });

  // -- Chat Logic (UPDATED) --

  // NEW: Fetch Chat History
  socket.on('get_chat_history', (tradeId: string) => {
      // Filter messages for this specific trade
      const history = messages.filter(m => m.tradeId === tradeId);
      // Send back to the user who asked
      socket.emit('chat_history', history);
  });

  socket.on('send_trade_message', (data: any) => {
      const messageData: ChatMessage = { ...data, timestamp: Date.now() };
      
      // 1. SAVE to Memory (Fixes "Clears on Refresh" & "Late Joiner")
      messages.push(messageData);

      // 2. Send to Recipient (if online)
      const recipientSocketId = usersMap.get(data.recipientId);
      if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_trade_message', messageData);
          // Optional: Send a 'notification' event here if you want a global red dot for chats too
      }
      
      // 3. Echo back to Sender (for immediate UI update)
      socket.emit('receive_trade_message', messageData);
  });

  socket.on('disconnect', () => {
    if (socket.data.userId) {
      usersMap.delete(socket.data.userId);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO Server running on port ${PORT}`);
}); 