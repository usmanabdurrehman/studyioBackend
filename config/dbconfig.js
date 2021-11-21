var mongoose = require("mongoose");
let { io } = require("../server");

const { Notification } = require("../Models");

mongoose
  .connect(
    "mongodb+srv://QWERTY:QWERTY@cluster0.usc1l.mongodb.net/studyio?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("MongoDB connected");
    io.on("connection", (socket) => {
      console.log("user connected");
      socket.on("joinRoom", (data) => {
        console.log(`User joined room with id ${data.id}`);
        socket.join(data.id);
      });

      socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });

      //watches the collection for any inserted documents
      function startWatcher() {
        Notification.watch()
          .on("change", (change) => {
            if (change.operationType == "insert") {
              console.log("insert event triggered on notification");
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
