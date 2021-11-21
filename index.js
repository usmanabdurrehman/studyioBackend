const cors = require("cors");
const session = require("express-session");
const path = require("path");
const db = require("./config/dbconfig");

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const { io, app, server } = require("./server");

const express = require("express");

const util = require("util");

util.inspect.defaultOptions.maxArrayLength = null;
util.inspect.defaultOptions.compact = false;
util.inspect.defaultOptions.depth = null;

//Configuring App wide variables
app.set("port", process.env.PORT || 7000);

//Body Parser Middleware
app.use(express.json());

//CORS Middleware
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(cookieParser());
app.use((req, res, next) => {
  next();
});

app.use("/user", (req, res, next) => {
  let token = req.cookies["token"];

  if (token) {
    jwt.verify(token, "sdjsilciur", (err, decoded) => {
      if (err) return res.sendStatus(403);
      req.user = decoded.user;
      return next();
    });
  } else {
    return res.sendStatus(403);
  }
});

//Static Middleware
app.use(express.static(path.join(__dirname, "public")));

//API endpoints
app.use("/", require("./APIs/publicAPI"));
app.use("/user", require("./APIs/protectedAPI"));

server.listen(7000, (req, res) => {
  console.log("Server running on PORT 7000");
});
