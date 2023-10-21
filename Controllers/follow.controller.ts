import { UserModel, Post, Notification } from "../Models";

import { UNEXPECTED_ERROR } from "../constants";
import { APIFunction } from "../types";
const ObjectId = require("mongoose").Types.ObjectId;

export const follow: APIFunction = (req, res) => {
  let { _id } = req.user;
  let { userId } = req.body;
  UserModel.findByIdAndUpdate(userId, { $push: { followers: _id } })
    .then((user: User) => {
      UserModel.findByIdAndUpdate(_id, { $push: { following: userId } })
        .then((user) => {
          const newNotification = new Notification({
            action: "followed",
            doer: ObjectId(_id),
            reciever: ObjectId(userId),
            seen: false,
          });
          newNotification
            .save()
            .then(() => {
              return res.send({ status: true });
            })
            .catch(() => {
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
export const unfollow: APIFunction = (req, res) => {
  let { _id } = req.user;
  let { userId } = req.body;
  UserModel.findByIdAndUpdate(userId, { $pull: { followers: _id } })
    .then((user) => {
      UserModel.findByIdAndUpdate(_id, { $pull: { following: _id } })
        .then((user) => {
          return res.send({ status: true });
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
