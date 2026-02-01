import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import connectDB from "./config/db.js";
import boardRoutes from "./routes/boardRoutes.js";
import columnRoutes from "./routes/columnRoutes.js";
import { initSocket } from "./socket/index.js";
import { initDefaultBoard } from "./bootstrap/initBoard.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);

// HTTP + Socket
const server = http.createServer(app);
initSocket(server);

// 🔥 Proper startup sequence
const startServer = async () => {
  try {
    await connectDB();

    // ✅ AUTO-CREATE DEFAULT BOARD (ONE TIME)
    await initDefaultBoard();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start", err);
    process.exit(1);
  }
};

startServer();
