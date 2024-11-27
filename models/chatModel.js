import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  images:[{
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },],  // Include images
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chat", chatSchema);
