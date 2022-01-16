const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    bio:String,
    followers: [mongoose.Schema.Types.ObjectId],
    following: [mongoose.Schema.Types.ObjectId],
    profileImage: String,
  },
  { timestamps: true }
);
const User = mongoose.model("User", schema);

module.exports = User;
