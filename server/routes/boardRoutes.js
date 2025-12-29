import express from "express";
import {
  createBoard,
  getBoard,
  createColumn,
  moveCard
} from "../controllers/boardController.js";

const router = express.Router();

router.post("/", createBoard);
router.get("/:boardId", getBoard);
router.post("/:boardId/columns", createColumn);


router.patch("/:boardId/move-card", moveCard);

export default router;
