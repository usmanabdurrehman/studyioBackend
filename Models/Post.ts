import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    comment: String,
    commenter: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

const fileSchema = new mongoose.Schema(
  {
    filename: String,
    originalFilename: String,
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    postText: String,
    userId: mongoose.Schema.Types.ObjectId,
    comments: [commentSchema],
    likes: [String],
    files: [fileSchema],
    images: [String],
    hidden: Boolean,
  },
  { timestamps: true }
);

export const PostModel = mongoose.model("Post", postSchema);
