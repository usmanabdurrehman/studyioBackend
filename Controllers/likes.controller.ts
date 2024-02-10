import { NotificationModel, PostModel } from "../Models/index.js";

import { UNEXPECTED_ERROR } from "../constants/index.js";
import { APIFunction } from "../types/index.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const likePost: APIFunction = (req, res) => {
  let { email, _id } = req.user || {};
  let { postId } = req.body;
  PostModel.findByIdAndUpdate(
    postId,
    { $push: { likes: email } },
    { new: true }
  )
    .then((post) => {
      const newNotification = new NotificationModel({
        action: "liked",
        doer: new ObjectId(_id),
        reciever: new ObjectId(post.userId),
        postId: new ObjectId(postId),
        seen: false,
      });
      newNotification
        .save()
        .then(() => {
          return res.send({ status: true, msg: "Post Liked" });
        })
        .catch((err: Error) => {
          return res.send(UNEXPECTED_ERROR);
        });
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};
const unlikePost: APIFunction = (req, res) => {
  let { email } = req.user || {};
  let { postId } = req.body;
  PostModel.findByIdAndUpdate(postId, { $pull: { likes: email } })
    .then((post) => {
      return res.send({ status: true, msg: "Post unliked" });
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

export default { likePost, unlikePost };
