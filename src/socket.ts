import { Server, Socket } from 'socket.io';
import { handleNewPlayer, handleDisconnect } from './services/game-service';
import { createLogger } from './utils/logger';

const logger = createLogger('Socket');

export const initializeSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        handleNewPlayer(io, socket);

        socket.on('disconnect', () => {
            handleDisconnect(socket);
        });
    });
};