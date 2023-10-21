import mongoose from "mongoose";
import { io } from "../server";

const { Notification, Conversation } = require("../Models");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

mongoose
  .connect(process.env.DB_URI || "")
  .then(() => {
    console.log("MongoDB connected");

    io.use((socket, next) => {
      next();
    });

    io.use((socket, next) => {
      var cookief = socket.handshake.headers.cookie;
      var cookies = cookie.parse(cookief);
      if (cookies.token) {
        jwt.verify(cookies.token, "sdjsilciur", (err, decoded) => {
          if (err) return next(new Error("User is not logged in"));
          socket.user = decoded.user;
          return next();
        });
      } else {
        next(new Error("User is not logged in"));
      }
    });

    io.on("connection", (socket) => {
      console.log(`user connected with id ${socket.id}`);

      socket.on("joinRoom", (data) => {
        console.log(`User joined room with id ${data.id}`);
        socket.join(data.id);
      });
      socket.on("leaveRoom", (data) => {
        console.log(`User left room with id ${data.id}`);
        socket.leave(data.id);
      });

      socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });

      socket.on("message", ({ conversationId, message }) => {
        Conversation.findByIdAndUpdate(conversationId, {
          $push: {
            messages: { text: message, sentBy: socket.user._id, seen: false },
          },
        }).then(() => {
          io.to(conversationId).emit("message_change", {
            text: message,
            sentBy: socket.user._id,
          });
        });
      });

      //watches the collection for any inserted documents
      function startWatcher() {
        Notification.watch()
          .on("change", (change) => {
            if (change.operationType == "insert") {
              socket
                .to(change.fullDocument.reciever.toString())
                .emit("changes", JSON.stringify(change.fullDocument));
            }
          })
          .on("error", (e) => {
            //restart new watcher
            startWatcher();
          });
      }
      startWatcher();
    });
  })
  .catch((err) => {
    throw err;
  });
