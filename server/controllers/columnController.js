import Column from "../models/Column.js";
import Card from "../models/Card.js";

export const createCard = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Card title is required" });
    }

    const column = await Column.findById(columnId);
    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    const card = await Card.create({
      columnId,
      title,
      description: description || "",
      version: 0
    });

    column.cardIds.push(card._id);
    await column.save();

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: "Failed to create card" });
  }
};

