import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import lessonContentRoutes from "./routes/lessonContentRoutes.js";
import materialsToolsRoutes from "./routes/materialsTools.js";
import { Server } from 'socket.io';
import gameRoutes from "./routes/gamesRoutes.js";
import connectDB from './config/db.js';
import roomRoutes from './routes/roomRoutes.js';
import registerGameHandlers from './sockets/gameSocket.js';
import experimentRoutes from './routes/experimentRoutes.js';
import roomsRoutes from './routes/roomsRoutes.js';
import handleSocketConnection from './socket.js';
import authRoutes from './routes/authRoutes.js';
import questionsRoutes from './routes/questionsRoutes.js';
import path from 'path';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
app.use("/uploads", express.static("uploads"));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ Updated CORS options
const allowedOrigins = [
  'http://localhost:5173',
  'https://booxclash-3dweb.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Also update Socket.IO CORS config
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

registerGameHandlers(io);
handleSocketConnection(io);

app.use(express.json());
app.use('/api/rooms', roomRoutes);
app.use("/api", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/questions", questionsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use("/api/lesson-content", lessonContentRoutes);
app.use("/api/materials-tools", materialsToolsRoutes);
app.use('/api/experiments', experimentRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
