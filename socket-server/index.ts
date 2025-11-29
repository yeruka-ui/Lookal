import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

const PORT = process.env.SOCKET_PORT || 3001;

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
  attachment?: string; // Base64 Image
}

const trades: TradeProposal[] = []; 
const messages: ChatMessage[] = []; 
const usersMap = new Map<string, string>(); 

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  maxHttpBufferSize: 1e7 // 10MB limit (kept for high-res images)
});

io.on('connection', (socket) => {
  
  socket.on('authenticate_user', (userId: string) => {
      socket.data.userId = userId;
      usersMap.set(userId, socket.id);
      console.log(`User connected: ${userId}`);
  });

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

  socket.on('get_chat_history', (tradeId: string) => {
      const history = messages.filter(m => m.tradeId === tradeId);
      socket.emit('chat_history', history);
  });

  socket.on('typing', (data: { recipientId: string, tradeId: string, isTyping: boolean }) => {
      const recipientSocketId = usersMap.get(data.recipientId);
      if (recipientSocketId) {
          io.to(recipientSocketId).emit('display_typing', {
              tradeId: data.tradeId,
              isTyping: data.isTyping
          });
      }
  });

  socket.on('send_trade_message', (data: any) => {
      const messageData: ChatMessage = { ...data, timestamp: Date.now() };
      
      messages.push(messageData);

      const recipientSocketId = usersMap.get(data.recipientId);
      if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_trade_message', messageData);
      }
      
      // Echo back to sender
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