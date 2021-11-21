let { User, Post, Notification } = require("../Models");

const UNEXPECTED_ERROR = "Sorry, Something happened unexpectedly";
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  follow: (req, res) => {
    let { _id } = req.user;
    let { userId } = req.body;
    User.findByIdAndUpdate(userId, { $push: { followers: _id } })
      .then((user) => {
        User.findByIdAndUpdate(_id, { $push: { following: userId } })
          .then((user) => {
            const newNotification = new Notification({
              action: "followed",
              doer: ObjectId(_id),
              reciever: ObjectId(userId),
              seen: false,
            });
            newNotification
              .save()
              .then((notification) => {
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
      })
      .catch((err) => {
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
  unfollow: (req, res) => {
    let { _id } = req.user;
    let { userId } = req.body;
    User.findByIdAndUpdate(userId, { $pull: { followers: _id } })
      .then((user) => {
        User.findByIdAndUpdate(_id, { $pull: { following: _id } })
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
  },
};
