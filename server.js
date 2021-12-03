const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const socket = require("socket.io");
const jwt = require("jsonwebtoken");

const io = socket(server, {
  cors: { origin: true, credentials: true },
});

module.exports = { app, server, io };
