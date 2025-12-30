import boardRoutes from "./routes/boardRoutes.js";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import columnRoutes from "./routes/columnRoutes.js";
import cors from "cors";


dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());


connectDB();

const PORT = process.env.PORT || 5000;



app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);



import http from "http";
import { initSocket } from "./socket/index.js";

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

