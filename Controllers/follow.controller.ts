import { UserModel, NotificationModel } from "../Models/index.js";

import { UNEXPECTED_ERROR } from "../constants/index.js";
import { APIFunction, User } from "../types/index.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const follow: APIFunction = (req, res) => {
  let { _id } = req.user || {};
  let { userId } = req.body;
  UserModel.findByIdAndUpdate(userId, { $push: { followers: _id } })
    .then((user: User) => {
      UserModel.findByIdAndUpdate(_id, { $push: { following: userId } })
        .then((user) => {
          const newNotification = new NotificationModel({
            action: "followed",
            doer: new ObjectId(_id),
            reciever: new ObjectId(userId),
            seen: false,
          });
          newNotification
            .save()
            .then(() => {
              return res.send({ status: true });
            })
            .catch(() => {
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
const unfollow: APIFunction = (req, res) => {
  let { _id } = req.user || {};
  let { userId } = req.body;
  UserModel.findByIdAndUpdate(userId, { $pull: { followers: _id } })
    .then((user) => {
      UserModel.findByIdAndUpdate(_id, { $pull: { following: _id } })
        .then((user) => {
          return res.send({ status: true });
        })
        .catch((err) => {
          return res.send(UNEXPECTED_ERROR);
        });
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

export default { follow, unfollow };
