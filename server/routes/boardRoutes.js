import express from "express";
import {
  createBoard,
  getBoard,
  createColumn
} from "../controllers/boardController.js";


const router = express.Router();

router.post("/", createBoard);
router.get("/:boardId", getBoard);
router.post("/:boardId/columns", createColumn);


export default router;
