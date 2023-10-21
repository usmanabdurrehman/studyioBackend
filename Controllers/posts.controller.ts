import { User, Post } from "../Models";

const ObjectId = require("mongoose").Types.ObjectId;
import { UNEXPECTED_ERROR } from "../constants";

export const addPost = (req, res) => {
  let { _id: id } = req.user;
  let { post } = req.body;
  let newPost = new Post({
    postText: post,
    userId: id,
    comments: [],
    likes: [],
    files: req.attachmentNames,
    images: req.imageNames,
    hidden: false,
  });
  newPost
    .save()
    .then((post) => {
      return res.send({
        status: true,
      });
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};
export const updatePost = (req, res) => {
  const { post, postId, oldAttachments, oldImages } = req.body;
  Post.findByIdAndUpdate(postId, {
    postText: post,
    files: [...JSON.parse(oldAttachments), ...req.attachmentNames],
    images: [...JSON.parse(oldImages), ...req.imageNames],
  })
    .then((post) => {
      return res.send({
        status: true,
      });
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};
export const deletePost = (req, res) => {
  let { postId } = req.body;
  Post.findByIdAndDelete(postId)
    .then(() => {
      return res.send({
        status: true,
      });
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};
export const getTimelinePosts = (req, res) => {
  let { _id, email } = req.user;
  User.findById(_id)
    .then((user) => {
      Post.aggregate([
        {
          $match: {
            userId: {
              $in: [...user.following, _id].map((id) => ObjectId(id)),
            },
            hidden: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "comments.commenter",
            foreignField: "_id",
            as: "commenters",
          },
        },
        { $sort: { createdAt: -1 } },
      ])
        .then((posts) => {
          return res.send(
            posts.map(({ commenters, comments, user, ...rest }) => ({
              ...rest,
              comments: comments.map((comment) => ({
                ...comment,
                commenter: commenters.find(
                  (commenter) =>
                    commenter._id.toString() == comment.commenter.toString()
                ),
              })),
              user: { ...user[0] },
              liked: rest.likes.includes(email),
            }))
          );
        })
        .catch((err) => {
          console.log(err);
          return res.send(UNEXPECTED_ERROR);
        });
    })
    .catch((err) => {
      console.log(err);
      return res.send(UNEXPECTED_ERROR);
    });
};
export const getProfileInformation = (req, res) => {
  let { id } = req.params;
  let { _id, email } = req.user;
  User.findById(id)
    .then((user) => {
      Post.aggregate([
        {
          $match: { userId: ObjectId(id) },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "comments.commenter",
            foreignField: "_id",
            as: "commenters",
          },
        },
        { $sort: { createdAt: -1 } },
      ])
        .then((posts) => {
          if (user.followers.includes(_id)) {
            user._doc.isFollowing = true;
          } else {
            user._doc.isFollowing = false;
          }
          return res.send({
            user,
            posts: posts.map(({ commenters, comments, user, ...rest }) => ({
              ...rest,
              comments: comments.map((comment) => ({
                ...comment,
                commenter: commenters.find(
                  (commenter) =>
                    commenter._id.toString() == comment.commenter.toString()
                ),
              })),
              user: { ...user[0] },
              liked: rest.likes.includes(email),
            })),
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
export const getPostById = (req, res) => {
  const { id } = req.params;
  const { email } = req.user;
  Post.aggregate([
    {
      $match: {
        _id: ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "comments.commenter",
        foreignField: "_id",
        as: "commenters",
      },
    },
    { $sort: { createdAt: -1 } },
  ])
    .then((post) => {
      post = post[0];
      post = {
        ...post,
        liked: post.likes.includes(email),
        comments: post.comments.map((comment) => ({
          ...comment,
          commenter: post.commenters.find(
            (commenter) =>
              commenter._id.toString() == comment.commenter.toString()
          ),
        })),
        user: post.user[0],
      };
      delete post.commenters;
      res.send(post);
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

export const hidePost = (req, res) => {
  const { postId } = req.body;

  Post.findByIdAndUpdate(postId, {
    hidden: true,
  })
    .then(() => {
      return res.send({
        status: true,
      });
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

export const unhidePost = (req, res) => {
  const { postId } = req.body;

  Post.findByIdAndUpdate(postId, {
    hidden: false,
  })
    .then(() => {
      return res.send({
        status: true,
      });
    })
    .catch((err) => {
      return res.send(UNEXPECTED_ERROR);
    });
};
