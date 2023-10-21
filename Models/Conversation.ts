import mongoose from "mongoose";

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

export const ConversationModel = mongoose.model("Conversation", schema);
