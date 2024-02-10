import { PostModel, NotificationModel } from "../Models/index.js";
import { UNEXPECTED_ERROR } from "../constants/index.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

import { APIFunction, Post } from "../types/index.js";

const commentOnPost: APIFunction = (req, res) => {
  let { _id } = req.user || {};
  let { postId, comment } = req.body;
  PostModel.findById(postId)
    .then((post: Post) => {
      const comments = [...post.comments, { commenter: _id, comment }];
      PostModel.findByIdAndUpdate(postId, { comments })
        .then((post: Post) => {
          const newNotification = new NotificationModel({
            action: "commented",
            doer: new ObjectId(_id),
            reciever: new ObjectId(post.userId),
            postId: new ObjectId(postId),
            seen: false,
          });
          newNotification
            .save()
            .then(() => {
              return res.send({
                status: true,
                msg: "Post Commented",
              });
            })
            .catch((err: Error) => {
              return res.send(UNEXPECTED_ERROR);
            });
        })
        .catch((err) => {
          return res.send(UNEXPECTED_ERROR);
        });
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

const deleteCommentFromPost: APIFunction = (req, res) => {
  let { postId, commentId } = req.body;
  PostModel.findById(postId)
    .then((post: Post) => {
      const comments = post.comments.filter(
        (comment) => comment._id != commentId
      );
      PostModel.findByIdAndUpdate(postId, { comments })
        .then((post: Post) => {
          return res.send({
            status: true,
            msg: "Post Commented",
          });
        })
        .catch((err) => {
          return res.send(UNEXPECTED_ERROR);
        });
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

export default { commentOnPost, deleteCommentFromPost };
