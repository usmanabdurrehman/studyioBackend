import mongoose from "mongoose";
import { io } from "../server";

import { NotificationModel, ConversationModel } from "../Models/index.js";

import jwt from "jsonwebtoken";

mongoose
  .connect(process.env.DB_URI || "")
  .then(() => {
    console.log("MongoDB connected");

    io.use((socket, next) => {
      const token = socket.handshake.headers["authorization"];
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET || "", (err, decoded) => {
          if (err) return next(new Error("User is not logged in"));
          (socket as any).user = (decoded as any).user;
          return next();
        });
      } else {
        next(new Error("User is not logged in"));
      }
    });

    io.on("connection", (socket) => {
      socket.on("joinRoom", (data) => {
        socket.join(data.id);
      });
      socket.on("leaveRoom", (data) => {
        socket.leave(data.id);
      });

      socket.on("connect_error", (err) => {});

      socket.on("message", ({ conversationId, message }) => {
        const user = (socket as any).user;

        ConversationModel.findByIdAndUpdate(conversationId, {
          $push: {
            messages: { text: message, sentBy: user._id, seen: false },
          },
        }).then(() => {
          io.to(conversationId).emit("messageChange", {
            conversationId,
          });
        });
      });

      // Watches the collection for any inserted documents
      function startWatcher() {
        NotificationModel.watch()
          .on("change", (change) => {
            if (change.operationType === "insert") {
              socket
                .to(change.fullDocument.reciever.toString())
                .emit("notificationChange");
            }
          })
          .on("error", (e) => {
            // Restart new watcher
            startWatcher();
          });
      }
      startWatcher();
    });
  })
  .catch((err) => {
    throw err;
  });
