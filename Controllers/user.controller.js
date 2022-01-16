let { User } = require("../Models");

const { UNEXPECTED_ERROR, ERROR, SUCCESS } = require("../constants");
const ObjectId = require("mongoose").Types.ObjectId;

const jwt = require("jsonwebtoken");

module.exports = {
  signup: (req, res) => {
    let { name, email, password, bio } = req.body;
    console.log(req.body);
    const newUser = new User({
      name,
      email,
      password,
      bio,
      profileImage: req.image,
      followers: [],
      following: [],
    });
    User.findOne({ email })
      .then((user) => {
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
            .catch((err) => {
              return res.send(UNEXPECTED_ERROR);
            });
        }
      })
      .catch((err) => {
        res.send(UNEXPECTED_ERROR);
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
              expires: new Date(
                Date.now() + (rememberMe ? 30 * 24 * 3600000 : 24 * 3600000)
              ),
            });
            return res.send({
              auth: true,
              user,
              token,
            });
          } else {
            return res.send({
              auth: false,
              alert: { type: ERROR, msg: "The password entered is incorrect" },
            });
          }
        } else {
          return res.send({
            auth: false,
            alert: {
              type: ERROR,
              msg: "There is no user registered with this email",
            },
          });
        }
      })
      .catch((err) => {
        return res.send(UNEXPECTED_ERROR);
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
        return res.send(UNEXPECTED_ERROR);
      });
  },
  updateProfileImage: (req, res) => {
    let { _id, profileImage } = req.user;
    User.findByIdAndUpdate(
      _id,
      { profileImage: req.image || profileImage },
      { new: true }
    )
      .then((user) => {
        return res.send({ status: true, user });
      })
      .catch((err) => {
        return res.send(UNEXPECTED_ERROR);
      });
  },
};
