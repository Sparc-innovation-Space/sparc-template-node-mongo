// What your data looks like. Add a model here, then use it in server.js. To add an index, declare it on the schema:
// it is created at the next start.
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  { text: { type: String, required: true, trim: true, maxlength: 500 } },
  { timestamps: true, versionKey: false },
);
noteSchema.index({ createdAt: -1 });

const Note = mongoose.model("Note", noteSchema);

module.exports = { Note, all: [Note] };
