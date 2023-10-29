import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    action: String, // liked | commented | followed
    doer: mongoose.Schema.Types.ObjectId,
    reciever: mongoose.Schema.Types.ObjectId,
    postId: mongoose.Schema.Types.ObjectId,
    seen: Boolean,
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model("Notification", schema);
