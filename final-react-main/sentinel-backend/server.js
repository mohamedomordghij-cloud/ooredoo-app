import "dotenv/config";
// config env
import "./config/env.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

// route imports
import authRoutes from "./routes/authRoutes.js";
import datacenterRoutes from "./routes/datacenterRoutes.js";
import zoneRoutes from "./routes/zoneRoutes.js";
import nodeRoutes from "./routes/nodeRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import thresholdRoutes from "./routes/thresholdRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { startRealtimeSimulator } from "./services/realtimeSimulator.js";

const app = express();

// connect DB
connectDB();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/datacenters", datacenterRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/nodes", nodeRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/thresholds", thresholdRoutes);
app.use("/api/users", userRoutes);

// health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// port
const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server (instead of app.listen)
const server = http.createServer(app);

// ✅ Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:8081", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});


// ✅ Optional socket auth (so we can email connected users)
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization?.startsWith("Bearer ")
        ? socket.handshake.headers.authorization.split(" ")[1]
        : null);

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("email role fullName");
    if (user) {
      socket.data.user = { id: String(user._id), email: user.email, role: user.role, fullName: user.fullName };
    }
    return next();
  } catch (e) {
    // Don't block connection; just treat as unauthenticated
    return next();
  }
});

// ✅ Socket events
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-datacenter", (dcId) => {
    socket.join(`dc:${dcId}`);
    console.log(`📌 Socket ${socket.id} joined room dc:${dcId}`);
  });

  socket.on("leave-datacenter", (dcId) => {
    socket.leave(`dc:${dcId}`);
    console.log(`📤 Socket ${socket.id} left room dc:${dcId}`);
  });


  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ✅ Start simulator AFTER io exists
startRealtimeSimulator(io, { intervalMs: 2000 });

// ✅ Start server
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// ✅ export io so other files can emit if needed
export { io };