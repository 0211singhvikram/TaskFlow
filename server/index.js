import boardRoutes from "./routes/boardRoutes.js";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import columnRoutes from "./routes/columnRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());


connectDB();

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
