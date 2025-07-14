import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { BoardState, Game, MovePayload } from '../interfaces/game-interface';

const waitingPlayers: Socket[] = [];
const activeGames = new Map<string, Game>();

const createNewGame = (player1: Socket, player2: Socket): Game => {
    const roomId = uuidv4();
    const initialBoard: BoardState = [null, null, null, null, null, null, null, null, null ];

    return {
        roomId,
        board: initialBoard,
        players: {
            'X': player1.id,
            'O': player2.id,
        },
        currentPlayer: 'X',
        status: 'in-progress',
        winner: null,
    };
};

const checkGameOutcome = (board: BoardState) => {
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of winningCombos) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (board.every(cell => cell !== null)) {
        return 'draw';
    }

    return null;
};

export const handleNewPlayer = (io: Server, socket: Socket) => {
    console.log(`New player: ${socket.id}`);
    waitingPlayers.push(socket);

    if (waitingPlayers.length >= 2) {
        const player1 = waitingPlayers.shift()!;
        const player2 = waitingPlayers.shift()!;

        console.log(`Starting game: X=${player1.id}, O=${player2.id}`);

        const game = createNewGame(player1, player2);
        activeGames.set(game.roomId, game);

        player1.join(game.roomId);
        player2.join(game.roomId);

        player1.emit('game_start', { roomId: game.roomId, yourSymbol: 'X', opponentId: player2.id });
        player2.emit('game_start', { roomId: game.roomId, yourSymbol: 'O', opponentId: player1.id });

        io.to(game.roomId).emit('board_update', game.board);
    } else {
        socket.emit('status_update', { message: 'Waiting for an opponent...' });
    }
};

export const handleMakeMove = (io: Server, socket: Socket, payload: MovePayload) => {
    const { roomId, cellIndex } = payload;
    const game = activeGames.get(roomId);

    if (!game) {
        console.error(`Game not found: ${roomId}`);
        socket.emit('error_message', { message: 'Game not found' });
        return;
    }

    const playerSymbol = game.players['X'] === socket.id ? 'X' : 'O';

    if (game.currentPlayer !== playerSymbol) {
        console.warn(`Not ${playerSymbol}'s turn in room: ${roomId}`);
        socket.emit('error_message', { message: 'It is not your turn' });
        return;
    }

    if (game.board[cellIndex] !== null) {
        console.warn(`Cell occupied in room: ${roomId}`);
        socket.emit('error_message', { message: 'This cell is already taken' });
        return;
    }

    game.board[cellIndex] = playerSymbol;
    const outcome = checkGameOutcome(game.board);

    if (outcome) {
        game.status = 'completed';
        game.winner = outcome;
        io.to(roomId).emit('game_update', { board: game.board, currentPlayer: game.currentPlayer });
        io.to(roomId).emit('game_over', { winner: game.winner });
        console.log(`Game over in room: ${roomId}, Winner: ${game.winner}`);

        setTimeout(() => {
            activeGames.delete(roomId);
            console.log(`Cleaned up room: ${roomId}`);
        }, 10000);
    } else {
        game.currentPlayer = playerSymbol === 'X' ? 'O' : 'X';
        activeGames.set(roomId, game);
        io.to(roomId).emit('game_update', {
            board: game.board,
            currentPlayer: game.currentPlayer,
        });
        console.log(`Move by ${playerSymbol} in room: ${roomId}, cell: ${cellIndex}`);
    }
};

export const handleDisconnect = (socket: Socket) => {
    const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
    if (waitingIndex !== -1) {
        waitingPlayers.splice(waitingIndex, 1);
        console.log(`Player disconnected and removed: ${socket.id}`);
    }
};