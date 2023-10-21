import { PostModel, Notification } from "../Models";
import { UNEXPECTED_ERROR } from "../constants";
const ObjectId = require("mongoose").Types.ObjectId;

import { APIFunction, Post } from "../types";

export const commentOnPost: APIFunction = (req, res) => {
  let { _id } = req.user;
  let { postId, comment } = req.body;
  PostModel.findById(postId)
    .then((post: Post) => {
      const comments = [...post.comments, { commenter: _id, comment }];
      PostModel.findByIdAndUpdate(postId, { comments })
        .then((post: Post) => {
          const newNotification = new Notification({
            action: "commented",
            doer: ObjectId(_id),
            reciever: ObjectId(post.userId),
            postId: ObjectId(postId),
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
              return res.send({
                status: false,
                msg: UNEXPECTED_ERROR,
              });
            });
        })
        .catch((err) => {
          return res.send({
            status: false,
            msg: UNEXPECTED_ERROR,
          });
        });
    })
    .catch((err) => {
      return res.send({
        status: false,
        msg: UNEXPECTED_ERROR,
      });
    });
};

export const deleteCommentFromPost: APIFunction = (req, res) => {
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
          return res.send({
            status: false,
            msg: UNEXPECTED_ERROR,
          });
        });
    })
    .catch((err) => {
      return res.send({
        status: false,
        msg: UNEXPECTED_ERROR,
      });
    });
};
