let { Conversation } = require("../Models");

const UNEXPECTED_ERROR = "Sorry, Something happened unexpectedly";
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  startConversation: (req, res) => {
    const { id } = req.body;
    const { _id } = req.user;

    const newConversation = new Conversation({
      participants: [ObjectId(id), ObjectId(_id)],
      messages: [],
      seenBy: [],
    });

    newConversation
      .save()
      .then((conversation) => {
        res.send({
          status: true,
          conversation,
        });
      })
      .catch((err) => {
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
  getConversationById: (req, res) => {
    const { id } = req.params;

    Conversation.aggregate([
      {
        $match: {
          _id: ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
        },
      },
    ])
      .then((conversations) => {
        res.send({
          status: true,
          conversation: conversations.map((conversation) => ({
            ...conversation,
            participants: conversation.participants.map(
              ({ _id, name, profileImage }) => ({
                _id,
                name,
                profileImage,
              })
            ),
          }))[0],
        });
      })
      .then((conversation) => {
        res.send({
          status: true,
          conversation,
        });
      })
      .catch((err) => {
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
  getConversationsOfUser: (req, res) => {
    const { _id } = req.user;
    Conversation.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
        },
      },
    ])
      .then((conversations) => {
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
      })
      .catch((err) => {
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
};
