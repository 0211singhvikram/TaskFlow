import express from "express";
import { createCard } from "../controllers/columnController.js";

const router = express.Router();

router.post("/:columnId/cards", createCard);

export default router;
