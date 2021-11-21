let { User, Post, Notification } = require("../Models");

const UNEXPECTED_ERROR = "Sorry, Something happened unexpectedly";
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  likePost: (req, res) => {
    let { email, _id } = req.user;
    let { postId } = req.body;
    Post.findByIdAndUpdate(postId, { $push: { likes: email } }, { new: true })
      .then((post) => {
        const newNotification = new Notification({
          action: "liked",
          doer: ObjectId(_id),
          reciever: ObjectId(post.userId),
          postId: ObjectId(postId),
          seen: false,
        });
        newNotification
          .save()
          .then(() => {
            return res.send({ status: true, msg: "Post Liked" });
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
  unlikePost: (req, res) => {
    let { email } = req.user;
    let { postId } = req.body;
    Post.findByIdAndUpdate(postId, { $pull: { likes: email } })
      .then((post) => {
        return res.send({ status: true, msg: "Post unliked" });
      })
      .catch((err) => {
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
};
