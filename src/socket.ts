import { Server, Socket } from 'socket.io';
import { handleNewPlayer, handleDisconnect } from './services/game-service';
import { MovePayload } from './interfaces/game-interface';
import { makeMoveController } from './controllers/game-controller';

export const initializeSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        handleNewPlayer(io, socket);
        socket.on('make_move', (payload: MovePayload) => {
            makeMoveController(io, socket, payload);
        });

        socket.on('disconnect', () => {
            handleDisconnect(socket);
        });
    });
};