import { UNEXPECTED_ERROR } from "../constants/index.js";
import { NotificationModel } from "../Models/index.js";
import { APIFunction } from "../types/index.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const getNotifications: APIFunction = (req, res) => {
  let { _id } = req.user || {};
  NotificationModel.aggregate([
    { $addFields: { fromSamePerson: { $eq: ["$doer", "$reciever"] } } },
    {
      $match: {
        $and: [{ reciever: new ObjectId(_id) }, { fromSamePerson: false }],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "doer",
        foreignField: "_id",
        as: "doer",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "reciever",
        foreignField: "_id",
        as: "reciever",
      },
    },
    {
      $addFields: {
        profileImage: "$doer.profileImage",
        name: "$doer.name",
        doerId: "$doer._id",
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        postId: 1,
        name: 1,
        action: 1,
        profileImage: 1,
        doerId: 1,
      },
    },
    {
      $limit: 5,
    },
  ])
    .then((notifications) => {
      return res.send(
        notifications.map(
          ({ _id, postId, name, action, profileImage, doerId }) => {
            const messageWrapper: any = {
              followed: `${name[0]} has started following you`,
              liked: `${name[0]} has ${action} your post`,
              commented: `${name[0]} has ${action} on your post`,
            };
            return {
              _id: _id,
              postId: postId,
              message: messageWrapper[action],
              action,
              profileImage: profileImage[0],
              doerId: doerId[0],
            };
          }
        )
      );
    })
    .catch((err) => {
      return res.send({
        status: false,
        msg: UNEXPECTED_ERROR,
      });
    });
};
const getUnseenNotificationsCount: APIFunction = (req, res) => {
  const { _id } = req.user || {};
  NotificationModel.aggregate([
    { $addFields: { fromSamePerson: { $eq: ["$doer", "$reciever"] } } },
    {
      $match: {
        $and: [
          { reciever: new ObjectId(_id), seen: false },
          { fromSamePerson: false },
        ],
      },
    },
    { $count: "notificationCount" },
  ])
    .then((count) => {
      return res.send({
        notificationCount: count[0]?.notificationCount || 0,
      });
    })
    .catch((err) => {
      return res.send({
        status: false,
        msg: UNEXPECTED_ERROR,
      });
    });
};
const seeNotifications: APIFunction = (req, res) => {
  let { _id } = req.user || {};
  NotificationModel.updateMany(
    { reciever: new ObjectId(_id), seen: false },
    { seen: true }
  )
    .then((notification) => {
      return res.send({ status: true, msg: "Notifications seened" });
    })
    .catch((err) => {
      return res.send({
        status: false,
        msg: UNEXPECTED_ERROR,
      });
    });
};

export default {
  seeNotifications,
  getNotifications,
  getUnseenNotificationsCount,
};
