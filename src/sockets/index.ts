import { Server } from 'socket.io';
import { createServer } from 'http';
import type { Express } from 'express';
import { initTvChannel } from './tv.channel';

export function attachSockets(app: Express) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: '*' } });
  const tv = initTvChannel(io);

  return { httpServer, io, channels: { tv } };
}
