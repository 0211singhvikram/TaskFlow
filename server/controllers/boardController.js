import mongoose from "mongoose";
import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Card from "../models/Card.js";
import { getIO } from "../socket/index.js";


export const createBoard = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Board name is required" });
    }

    const board = await Board.create({
      name,
      columnIds: [],
      version: 0
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: "Failed to create board" });
  }
};

export const getBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const columns = await Column.find({ boardId: board._id });
    const columnIds = columns.map(col => col._id);

    const cards = await Card.find({ columnId: { $in: columnIds } });

    res.status(200).json({
      board,
      columns,
      cards
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch board" });
  }
};

export const createColumn = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Column title is required" });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const column = await Column.create({
      boardId,
      title,
      cardIds: [],
      version: 0
    });

    board.columnIds.push(column._id);
    await board.save();

    res.status(201).json(column);
  } catch (error) {
    res.status(500).json({ message: "Failed to create column" });
  }
};


  //  Drag & Drop Backend


export const moveCard = async (req, res) => {
  const {
    cardId,
    sourceColumnId,
    destinationColumnId,
    sourceIndex,
    destinationIndex,
    sourceVersion,
    destinationVersion
  } = req.body;

  const cardObjectId = new mongoose.Types.ObjectId(cardId);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ===============================
    // SAME COLUMN MOVE
    // ===============================
    if (sourceColumnId === destinationColumnId) {
      const column = await Column.findOne(
        { _id: sourceColumnId, version: sourceVersion }
      ).session(session);

      if (!column) {
        await session.abortTransaction();
        return res.status(409).json({ message: "Version conflict" });
      }

      column.cardIds.splice(sourceIndex, 1);
      column.cardIds.splice(destinationIndex, 0, cardObjectId);
      column.version += 1;

      await column.save({ session });
      await session.commitTransaction();

      const io = getIO();
      const boardId = column.boardId.toString();

      io.to(`board:${boardId}`).emit("board-updated");

      return res.json({ success: true });
    }

    // ===============================
    // CROSS COLUMN MOVE
    // ===============================
    const sourceColumn = await Column.findOneAndUpdate(
      { _id: sourceColumnId, version: sourceVersion },
      {
        $pull: { cardIds: cardObjectId },
        $inc: { version: 1 }
      },
      { new: true, session }
    );

    if (!sourceColumn) {
      await session.abortTransaction();
      return res.status(409).json({ message: "Source version conflict" });
    }

    const destinationColumn = await Column.findOneAndUpdate(
      { _id: destinationColumnId, version: destinationVersion },
      {
        $push: {
          cardIds: { $each: [cardObjectId], $position: destinationIndex }
        },
        $inc: { version: 1 }
      },
      { new: true, session }
    );

    if (!destinationColumn) {
      await session.abortTransaction();
      return res.status(409).json({ message: "Destination version conflict" });
    }

    await session.commitTransaction();

    const io = getIO();
    const boardId = sourceColumn.boardId.toString();

    io.to(`board:${boardId}`).emit("board-updated");

    res.json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
