const util = require("util");

util.inspect.defaultOptions.maxArrayLength = null;
util.inspect.defaultOptions.compact = false;
util.inspect.defaultOptions.depth = null;

const ObjectId = require("mongoose").Types.ObjectId;

const UNEXPECTED_ERROR = "Sorry, Something happened unexpectedly";

const db = require("./config/dbconfig");
const { Conversation } = require("./Models");

const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://QWERTY:QWERTY@cluster0.usc1l.mongodb.net/studyio?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("MongoDB connected");
    Conversation.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
        },
      },
    ]).then((conversations) => {
      res.send({
        status: true,
        conversations: conversations.map((conversation) => ({
          ...conversation,
          participants: conversation.participants.map(
            ({ _id, name, profileImage }) => ({
              _id,
              name,
              profileImage,
            })
          ),
        })),
      });
    });
  })
  .catch((err) => {
    throw err;
  });
