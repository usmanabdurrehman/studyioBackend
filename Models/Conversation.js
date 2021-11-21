const mongoose = require("mongoose");

const Message = new mongoose.Schema(
  {
    sentBy: mongoose.Schema.Types.ObjectId,
    text: String,
  },
  { timestamps: true }
);

const schema = new mongoose.Schema(
  {
    participants: [mongoose.Schema.Types.ObjectId],
    messages: [Message],
    seenBy: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", schema);

module.exports = Conversation;
