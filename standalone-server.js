const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

// Socket.IO server with CORS enabled
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins (change in production)
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: '🎙️ Walkie Talkie Server',
        connections: io.engine.clientsCount
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);
    console.log('📊 Total connections:', io.engine.clientsCount);

    // 🔹 JOIN ROOM
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`✅ ${socket.id} joined room: ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
            userId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    // 🔹 AUDIO MESSAGE
    socket.on('audio-message', (data) => {
        const { roomId, audio } = data;
        console.log(`📤 Broadcasting audio to room: ${roomId}`);

        // Send to everyone in the room EXCEPT the sender
        socket.to(roomId).emit('audio-message', {
            audio,
            senderId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    // 🔹 LEAVE ROOM
    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        console.log(`👋 ${socket.id} left room: ${roomId}`);

        // Notify others
        socket.to(roomId).emit('user-left', {
            userId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    // 🔹 DISCONNECT
    socket.on('disconnect', () => {
        console.log('👋 User disconnected:', socket.id);
        console.log('📊 Total connections:', io.engine.clientsCount);
    });

    // 🔹 ERROR HANDLING
    socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
    });
});

// Error handling
httpServer.on('error', (error) => {
    console.error('❌ Server error:', error);
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   🎙️  Walkie Talkie Server Started   ║
╚═══════════════════════════════════════╝

📡 Server running on port: ${PORT}
🌐 Health check: http://localhost:${PORT}/health
🔌 Socket.IO endpoint: ws://localhost:${PORT}

Ready to accept connections! 🚀
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, closing server...');
    httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, closing server...');
    httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
