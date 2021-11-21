const mongoose = require("mongoose");

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

const Notification = mongoose.model("Notification", schema);

module.exports = Notification;
