import mongoose from "mongoose";

const columnSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    cardIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card"
      }
    ],

    version: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Column = mongoose.model("Column", columnSchema);

export default Column;
