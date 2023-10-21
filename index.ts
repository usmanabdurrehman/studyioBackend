require("dotenv").config();

import express from "express";
import cors from "cors";
require("./config/dbconfig");

import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import { app, server } from "./server";

const util = require("util");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

util.inspect.defaultOptions.maxArrayLength = null;
util.inspect.defaultOptions.compact = false;
util.inspect.defaultOptions.depth = null;

app.set("port", process.env.PORT || 7000);

app.use(express.json());

//CORS Middleware
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(cookieParser());

app.use("/user", (req, res, next) => {
  let token = req.cookies["token"];

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET || "",
      (err: any, decoded: any) => {
        if (err) return res.sendStatus(403);
        (req as any).user = decoded.user;
        return next();
      }
    );
  } else {
    return res.sendStatus(403);
  }
});

app.use("/", require("./APIs/publicAPI"));
app.use("/user", require("./APIs/protectedAPI"));

server.listen(app.get("port"), () => {
  console.log("Server running on PORT 7000");
});
