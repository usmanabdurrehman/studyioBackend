import { UserModel, PostModel } from "../Models/index.js";

import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import { UNEXPECTED_ERROR } from "../constants/index.js";
import { APIFunction, Post } from "../types/index.js";

const addPost: APIFunction = (req, res) => {
  let { _id: id } = req.user || {};
  let { post } = req.body;
  let newPost = new PostModel({
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
    .then((post: Post) => {
      return res.send({
        status: true,
      });
    })
    .catch((err: Error) => {
      return res.send(UNEXPECTED_ERROR);
    });
};
const updatePost: APIFunction = (req, res) => {
  const { post, postId, oldAttachments, oldImages } = req.body;
  PostModel.findByIdAndUpdate(postId, {
    postText: post,
    files: [...JSON.parse(oldAttachments), ...(req?.attachmentNames || [])],
    images: [...JSON.parse(oldImages), ...(req.imageNames || [])],
  })
    .then((post: Post) => {
      return res.send({
        status: true,
      });
    })
    .catch((err: Error) => {
      return res.send(UNEXPECTED_ERROR);
    });
};
const deletePost: APIFunction = (req, res) => {
  let { postId } = req.body;
  PostModel.findByIdAndDelete(postId)
    .then(() => {
      return res.send({
        status: true,
      });
    })
    .catch((err: Error) => {
      return res.send(UNEXPECTED_ERROR);
    });
};
const getTimelinePosts: APIFunction = (req, res) => {
  let { _id, email } = req.user || {};
  UserModel.findById(_id)
    .then((user) => {
      PostModel.aggregate([
        {
          $match: {
            userId: {
              $in: [...user.following, _id].map((id) => new ObjectId(id)),
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
              comments: comments.map((comment: any) => ({
                ...comment,
                commenter: commenters.find(
                  (commenter: any) =>
                    commenter._id.toString() == comment.commenter.toString()
                ),
              })),
              user: { ...user[0] },
              liked: rest.likes.includes(email),
            }))
          );
        })
        .catch((err: Error) => {
          console.log(err);
          return res.send(UNEXPECTED_ERROR);
        });
    })
    .catch((err: Error) => {
      console.log(err);
      return res.send(UNEXPECTED_ERROR);
    });
};
const getProfileInformation: APIFunction = (req, res) => {
  let { id } = req.params;
  let { _id, email } = req.user || {};
  UserModel.findById(id)
    .then((user) => {
      PostModel.aggregate([
        {
          $match: { userId: new ObjectId(id) },
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
              comments: comments.map((comment: any) => ({
                ...comment,
                commenter: commenters.find(
                  (commenter: any) =>
                    commenter._id.toString() == comment.commenter.toString()
                ),
              })),
              user: { ...user[0] },
              liked: rest.likes.includes(email),
            })),
          });
        })
        .catch((err: Error) => {
          return res.send(UNEXPECTED_ERROR);
        });
    })
    .catch((err: Error) => {
      return res.send(UNEXPECTED_ERROR);
    });
};
const getPostById: APIFunction = (req, res) => {
  const { id } = req.params;
  const { email } = req.user || {};
  PostModel.aggregate([
    {
      $match: {
        _id: new ObjectId(id),
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
      let firstPost = post[0];
      firstPost = {
        ...post,
        liked: firstPost.likes.includes(email),
        comments: firstPost.comments.map((comment: any) => ({
          ...comment,
          commenter: firstPost.commenters.find(
            (commenter: any) =>
              commenter._id.toString() == comment.commenter.toString()
          ),
        })),
        user: firstPost.user[0],
      } as any;
      delete firstPost.commenters;
      res.send(post);
    })
    .catch((err: Error) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

const hidePost: APIFunction = (req, res) => {
  const { postId } = req.body;

  PostModel.findByIdAndUpdate(postId, {
    hidden: true,
  })
    .then(() => {
      return res.send({
        status: true,
      });
    })
    .catch((err: Error) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

const unhidePost: APIFunction = (req, res) => {
  const { postId } = req.body;

  PostModel.findByIdAndUpdate(postId, {
    hidden: false,
  })
    .then(() => {
      return res.send({
        status: true,
      });
    })
    .catch((err: Error) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

export default {
  unhidePost,
  hidePost,
  deletePost,
  getPostById,
  getTimelinePosts,
  getProfileInformation,
  addPost,
  updatePost,
};
