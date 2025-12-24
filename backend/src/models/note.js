const mongoose = require("mongoose");
const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    problem: { type: Schema.Types.ObjectId, ref: "problem", required: true },
    content: { type: String, default: "" },
  },
  { timestamps: true }
);

// Ensure one note per (user, problem)
noteSchema.index({ user: 1, problem: 1 }, { unique: true });

const Note = mongoose.model("note", noteSchema);
module.exports = Note;
