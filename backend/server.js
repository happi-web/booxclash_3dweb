import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import roomRoutes from './routes/roomRoutes.js';
import setupSocket from './sockets/gameSocket.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// CORS configuration to allow credentials
const corsOptions = {
  origin: 'http://localhost:5173',  // Allow frontend to connect
  methods: ['GET', 'POST'],
  credentials: true,  // Allow cookies and other credentials
};

app.use(cors(corsOptions)); // Apply CORS middleware

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',  // Allow frontend origin
    methods: ['GET', 'POST'],
    credentials: true,  // Enable credentials
  },
});

setupSocket(io);

app.use(express.json());
app.use('/api/rooms', roomRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
