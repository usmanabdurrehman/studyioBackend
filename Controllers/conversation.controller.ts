import { ConversationModel, UserModel } from "../Models";

import { UNEXPECTED_ERROR } from "../constants";
import { APIFunction, Conversation, ServerRequest, User } from "../types";
const ObjectId = require("mongoose").Types.ObjectId;
import Express from "express";

export const startConversation: APIFunction = (req, res) => {
  const { id } = req.body;
  const { _id } = req.user;

  const newConversation = new ConversationModel({
    participants: [ObjectId(id), ObjectId(_id)],
    messages: [],
    seenBy: [],
  });

  newConversation
    .save()
    .then((conversation: Conversation) => {
      res.send({
        status: true,
        conversation,
      });
    })
    .catch((err: Error) => {
      return res.send({
        status: false,
        msg: UNEXPECTED_ERROR,
      });
    });
};
export const getConversationById = (
  req: ServerRequest,
  res: Express.Response
) => {
  const { id } = req.params;

  ConversationModel.aggregate([
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
    .then((conversations: Conversation[]) => {
      res.send({
        status: true,
        conversation: conversations.map((conversation) => ({
          ...conversation,
          participants: conversation.participants.map((user) => user),
        }))[0],
      });
    })
    .catch((err) => {
      return res.send({
        status: false,
        msg: UNEXPECTED_ERROR,
      });
    });
};
export const getConversationsOfUser: APIFunction = (req, res) => {
  const { _id: id } = req.user;
  ConversationModel.aggregate([
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
      return res.send({
        status: true,
        conversations: conversations.map((conversation) => ({
          ...conversation,
          participants: conversation.participants.map(
            ({ _id, name, profileImage }: User) => ({
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
};
export const fetchMorePeople: APIFunction = (req, res) => {
  let { name } = req.body;
  const { _id } = req.user;
  ConversationModel.find({ participants: ObjectId(_id) })
    .then((conversations) => {
      const idsOfContacts = [
        ...new Set(
          conversations.reduce((acc, val) => {
            return [...acc, ...val.participants];
          }, [])
        ),
      ];
      UserModel.find(
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
};
export const seeConversation: APIFunction = (req, res) => {
  let { id } = req.body;
  ConversationModel.updateMany(
    { _id: ObjectId(id), "messages.seen": false },
    {
      $set: {
        "messages.seen": true,
      },
    }
  )
    .then(() => {
      return res.send({ status: true, msg: "ConversationModel seened" });
    })
    .catch((err) => {
      return res.send({
        status: false,
        msg: UNEXPECTED_ERROR,
      });
    });
};
export const getAllConversationsUnseenMessagesCount: APIFunction = (
  req,
  res
) => {
  let { _id } = req.user;
  ConversationModel.find({ participants: ObjectId(_id) })
    .then((conversations: Conversation[]) => {
      const count = conversations.reduce((acc, val) => {
        acc += val.messages.filter((message) => !message.seen).length;
        return acc;
      }, 0);
      return res.send({ count });
    })
    .catch((err) => {
      return res.send({
        status: false,
        msg: UNEXPECTED_ERROR,
      });
    });
};

export const getConversationsUnseenMessagesCountById: APIFunction = (
  req,
  res
) => {
  let { id } = req.body;
  ConversationModel.findById(id)
    .then((conversation: Conversation) => {
      const count = (conversation || []).messages.filter(
        (message) => !message.seen
      ).length;
      return res.send({ count });
    })
    .catch((err) => {
      return res.send({
        status: false,
        msg: UNEXPECTED_ERROR,
      });
    });
};
