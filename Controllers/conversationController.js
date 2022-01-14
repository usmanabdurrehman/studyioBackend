let { Conversation, User } = require("../Models");

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
      .catch((err) => {
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
  getConversationsOfUser: (req, res) => {
    const { _id: id } = req.user;
    Conversation.aggregate([
      {
        $match: {
          participants: ObjectId(id),
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
  fetchMorePeople: (req, res) => {
    let { name } = req.body;
    const { _id } = req.user;
    Conversation.find({ participants: ObjectId(_id) })
      .then((conversations) => {
        const idsOfContacts = [
          ...new Set(
            conversations.reduce((acc, val) => {
              return [...acc, ...val.participants];
            }, [])
          ),
        ];
        User.find(
          {
            $and: [
              { name: new RegExp(name, "i") },
              { _id: { $nin: idsOfContacts } },
              { _id: { $ne: ObjectId(_id) } },
            ],
          },
          "_id name profileImage"
        )
          .then((users) => {
            return res.send(users);
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
  seeConversation: (req, res) => {
    let { id } = req.body;
    Conversation.updateMany({ _id: ObjectId(id) }, { "messages.seen": true })
      .then(() => {
        return res.send({ status: true, msg: "Conversation seened" });
      })
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
  getAllConversationsUnseenMessagesCount: (req, res) => {
    let { _id } = req.user;
    Conversation.find({ participants: ObjectId(_id) })
      .then((conversations) => {
        const count = conversations.reduce((acc, val) => {
          acc += val.messages.filter((message) => !message.seen).length;
          return acc;
        }, 0);
        console.log(count, conversations);
        return res.send({ count });
      })
      .catch((err) => {
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
  getConversationsUnseenMessagesCountById: (req, res) => {
    let { id } = req.body;
    Conversation.findById(id)
      .then((conversation) => {
        const count = (conversation || []).messages.filter(
          (message) => !message.seen
        ).length;
        return res.send({ count });
      })
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          msg: UNEXPECTED_ERROR,
        });
      });
  },
};
