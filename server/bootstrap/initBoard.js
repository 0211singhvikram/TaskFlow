import Board from "../models/Board.js";
import Column from "../models/Column.js";

export const initDefaultBoard = async () => {
  const boardCount = await Board.countDocuments();

  // Prevent duplicate boards on restart
  if (boardCount > 0) {
    console.log("✅ Board already exists. Skipping bootstrap.");
    return;
  }

  console.log("🚀 Creating default TaskFlow board...");

  // 1. Create board first
  const board = await Board.create({
    name: "TaskFlow Board",
    columnIds: [],
    version: 0
  });

  // 2. Create default columns
  const columns = await Column.insertMany([
    { title: "Todo", boardId: board._id, cardIds: [], version: 0 },
    { title: "Doing", boardId: board._id, cardIds: [], version: 0 },
    { title: "Done", boardId: board._id, cardIds: [], version: 0 }
  ]);

  // 3. Save column order in board
  board.columnIds = columns.map(col => col._id);
  await board.save();

  console.log("✅ Default board & columns created successfully");
};
