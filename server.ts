import express from "express";
export const app = express();

import http from "http";
export const server = http.createServer(app);

import { Socket } from "socket.io";

// export const io = socket(server, {
//   cors: { origin: true, credentials: true },
// });
