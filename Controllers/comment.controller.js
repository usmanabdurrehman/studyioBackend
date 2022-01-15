let { User, Post, Notification } = require("../Models");

const UNEXPECTED_ERROR = "Sorry, Something happened unexpectedly";
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  commentOnPost: (req, res) => {
    let { _id } = req.user;
    let { postId, comment } = req.body;
    Post.findById(postId)
      .then((post) => {
        const comments = [...post.comments, { commenter: _id, comment }];
        Post.findByIdAndUpdate(postId, { comments })
          .then((post) => {
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
  deleteCommentFromPost: (req, res) => {
    let { postId, commentId } = req.body;
    Post.findById(postId)
      .then((post) => {
        const comments = post.comments.filter(
          (comment) => comment._id != commentId
        );
        Post.findByIdAndUpdate(postId, { comments })
          .then((post) => {
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
  },
};
