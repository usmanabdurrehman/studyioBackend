const mongoose = require("mongoose");

const Message = new mongoose.Schema(
  {
    sentBy: mongoose.Schema.Types.ObjectId,
    text: String,
    seen: Boolean,
  },
  { timestamps: true }
);

const schema = new mongoose.Schema(
  {
    participants: [mongoose.Schema.Types.ObjectId],
    messages: [Message],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", schema);

module.exports = Conversation;
