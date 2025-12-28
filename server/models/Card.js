import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    version: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Card = mongoose.model("Card", cardSchema);

export default Card;
