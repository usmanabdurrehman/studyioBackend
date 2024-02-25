import express from "express";
export const app = express();

import http from "http";
export const server = http.createServer(app);

import { Server } from "socket.io";

export const io = new Server(server, {
  cors: { origin: true, credentials: true },
});
