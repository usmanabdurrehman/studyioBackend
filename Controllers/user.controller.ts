import { UserModel } from "../Models/index.js";

import { UNEXPECTED_ERROR, ERROR, SUCCESS } from "../constants/index.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

import jwt from "jsonwebtoken";
import { APIFunction, User } from "../types/index.js";

const signup: APIFunction = (req, res) => {
  let { name, email, password, bio } = req.body;

  const newUser = new UserModel({
    name,
    email,
    password,
    bio,
    profileImage: req.image,
    followers: [],
    following: [],
  });
  UserModel.findOne({ email })
    .then((user: User) => {
      if (user) {
        return res.send({
          status: false,
          alert: {
            type: ERROR,
            msg: `User Already exists with the email: ${email}`,
          },
        });
      } else {
        newUser
          .save()
          .then(() => {
            return res.send({
              status: true,
              alert: {
                type: SUCCESS,
                msg: "Account Successfully made. You can now sign in",
              },
            });
          })
          .catch((err: Error) => {
            return res.send(UNEXPECTED_ERROR);
          });
      }
    })
    .catch((err: Error) => {
      res.send(UNEXPECTED_ERROR);
    });
};

const signin: APIFunction = (req, res) => {
  let { email, password, rememberMe } = req.body;
  UserModel.findOne({ email })
    .then((user: User) => {
      if (user) {
        if (user.password === password) {
          const token = jwt.sign({ user }, process.env.JWT_SECRET || "", {
            expiresIn: rememberMe ? "30 days" : "1 day",
          });
          const ONE_DAY = 24 * 3600000;
          const THIRTY_DAYS = 30 * ONE_DAY;
          res.cookie("token", token, {
            secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            expires: new Date(
              Date.now() + (rememberMe ? THIRTY_DAYS : ONE_DAY)
            ),
            sameSite: "none",
          });
          return res.send({
            auth: true,
            user,
            token,
          });
        } else {
          return res.send({
            status: false,
            alert: { type: ERROR, msg: "The password entered is incorrect" },
          });
        }
      } else {
        return res.send({
          status: false,
          alert: {
            type: ERROR,
            msg: "There is no user registered with this email",
          },
        });
      }
    })
    .catch((err: Error) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

const logout: APIFunction = (req, res) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
  });
  res.send({ status: true });
};

const fetchNames: APIFunction = (req, res) => {
  let { name } = req.body;
  const { _id } = req.user || {};
  UserModel.find(
    {
      $and: [
        { name: new RegExp(name, "i") },
        { _id: { $ne: new ObjectId(_id) } },
      ],
    },
    "_id name profileImage"
  )
    .then((users: User[]) => {
      return res.send(users);
    })
    .catch((err: Error) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

const updateProfileImage: APIFunction = (req, res) => {
  let { _id, profileImage } = req.user || {};
  UserModel.findByIdAndUpdate(
    _id,
    { profileImage: req.image || profileImage },
    { new: true }
  )
    .then((user: User) => {
      return res.send({ status: true, user });
    })
    .catch((err: Error) => {
      return res.send(UNEXPECTED_ERROR);
    });
};

const getLoggedInUser: APIFunction = (req, res) => {
  res.send(req.user);
};

export default {
  updateProfileImage,
  signin,
  signup,
  logout,
  fetchNames,
  getLoggedInUser,
};
