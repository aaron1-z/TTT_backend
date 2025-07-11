import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { config } from './config/env-config';
import { initializeSocket } from './socket';
import { createLogger } from './utils/logger';

const logger = createLogger('Server');

const PORT = config.port;

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' },
});

initializeSocket(io);

httpServer.listen(PORT, () => {
    logger.info({port:PORT},`Tic tac toe server is running on port`);
});