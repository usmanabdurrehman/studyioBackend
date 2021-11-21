let { User, Post, Notification } = require("../Models");

const UNEXPECTED_ERROR = "Sorry, Something happened unexpectedly";
const ObjectId = require("mongoose").Types.ObjectId;

const jwt = require("jsonwebtoken");

module.exports = {
  signup: (req, res) => {
    let { name, email, password } = req.body;
    const newUser = new User({
      name,
      email,
      password,
      profileImage: req.filename,
      followers: [],
      following: [],
    });
    User.findOne({ email })
      .then((user) => {
        if (user) {
          return res.send({
            status: false,
            msg: `User Already exists with the email: ${email}`,
          });
        } else {
          newUser
            .save()
            .then(() => {
              return res.send({
                status: true,
                msg: "Account Successfully made. You can now sign in",
              });
            })
            .catch((err) => {
              return res.send({
                status: false,
                msg: UNEXPECTED_ERROR,
              });
            });
        }
      })
      .catch((err) => {
        res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
  signin: (req, res) => {
    let { email, password, rememberMe } = req.body;
    User.findOne({ email })
      .then((user) => {
        if (user) {
          if (user.password == password) {
            let token = jwt.sign({ user }, "sdjsilciur", {
              expiresIn: rememberMe ? "30 days" : "1 day",
            });
            res.cookie("token", token, {
              secure: process.env.NODE_ENV !== "development",
              httpOnly: true,
            });
            return res.send({
              auth: true,
              user,
              token,
            });
          } else {
            return res.send({
              auth: false,
              msg: "The password entered is incorrect",
            });
          }
        } else {
          return res.send({
            auth: false,
            msg: "There is no user registered with this email",
          });
        }
      })
      .catch((err) => {
        return res.send({
          auth: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
  logout: (req, res) => {
    res.clearCookie("token", {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
    });
    res.send({ status: true });
  },
  fetchNames: (req, res) => {
    let { name } = req.body;
    const { _id } = req.user;
    User.find(
      {
        $and: [
          { name: new RegExp(name, "i") },
          { _id: { $ne: ObjectId(_id) } },
        ],
      },
      "_id name profileImage"
    )
      .then((users) => {
        return res.send(users);
      })
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
  updateProfileImage: (req, res) => {
    let { _id, profileImage } = req.user;
    User.findByIdAndUpdate(
      _id,
      { profileImage: req.filename || profileImage },
      { new: true }
    )
      .then((user) => {
        return res.send({ status: true, user });
      })
      .catch((err) => {
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
};
