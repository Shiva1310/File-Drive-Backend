import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  key: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("File", fileSchema);
