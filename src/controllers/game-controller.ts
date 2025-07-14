import { Server, Socket } from 'socket.io';
import { handleMakeMove as handleMakeMoveService } from '../services/game-service';
import { MovePayload } from '../interfaces/game-interface';
import { createLogger } from '../utils/logger';

const logger = createLogger('GameController');

export const makeMoveController = (io: Server, socket: Socket, payload: MovePayload) => {
    try {
        if (payload.cellIndex === undefined || payload.cellIndex < 0 || payload.cellIndex > 8) {
            logger.warn({ payload, socketId: socket.id }, 'Invalid move payload received.');
            socket.emit('error_message', { message: 'Invalid move data sent.'});
            return;
        }
        handleMakeMoveService(io, socket, payload);
        
    } catch (error) {
        logger.error({ error, socketId: socket.id }, 'An error occurred in makeMoveController.');
        socket.emit('error_message', { message: 'An internal server error occurred.' });
    }
};