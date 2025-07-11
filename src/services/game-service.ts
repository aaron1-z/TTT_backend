import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { BoardState, Game } from '../interfaces/game-interface';

const waitingPlayers: Socket[] = [];
const activeGames = new Map<string, Game>();

const createNewGame = (player1: Socket, player2: Socket): Game => {
    const roomId = uuidv4();
    const initialBoard: BoardState = [null, null, null, null, null, null, null, null, null];

    const newGame: Game = {
        roomId: roomId,
        board: initialBoard,
        players: {
            'X': player1.id,
            'O': player2.id,
        },
        currentPlayer: 'X',
        status: 'in-progress',
        winner: null,
    };
    return newGame;
};

export const handleNewPlayer = (io: Server, socket: Socket) => {
    console.log(`New player waiting: ${socket.id}`);
    waitingPlayers.push(socket);

    if (waitingPlayers.length >= 2) {
        const player1 = waitingPlayers.shift()!;
        const player2 = waitingPlayers.shift()!;

        console.log(`Pairing players: X -> ${player1.id}, O -> ${player2.id}`);

        const game = createNewGame(player1, player2);
        activeGames.set(game.roomId, game);

        player1.join(game.roomId);
        player2.join(game.roomId);

        player1.emit('game_start', {
            roomId: game.roomId,
            yourSymbol: 'X',
            opponentId: player2.id
        });

        player2.emit('game_start', {
            roomId: game.roomId,
            yourSymbol: 'O',
            opponentId: player1.id
        });

        io.to(game.roomId).emit('board_update', game.board);
        console.log(`Game started in room: ${game.roomId}`);

    } else {
        socket.emit('status_update', { message: 'Waiting for an opponent...' });
    }
};

export const handleDisconnect = (socket: Socket) => {
    const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
    if (waitingIndex !== -1) {
        waitingPlayers.splice(waitingIndex, 1);
        console.log(`Removed waiting player after disconnect: ${socket.id}`);
    }
};
