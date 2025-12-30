import mongoose from "mongoose";


const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    columnIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Column"
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

const Board = mongoose.model("Board", boardSchema);

export default Board;
