import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    bio: String,
    followers: [mongoose.Schema.Types.ObjectId],
    following: [mongoose.Schema.Types.ObjectId],
    profileImage: String,
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", schema);
