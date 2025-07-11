export type PlayerSymbol = 'X' | 'O' ;
export type CellValue = PlayerSymbol | null ;

export type BoardState = [
    CellValue, CellValue, CellValue,
    CellValue, CellValue, CellValue,
    CellValue, CellValue, CellValue

];

export type GameStatus = 'waiting' | 'in-progress' | 'completed' ;

export interface Game {
    roomId : string ;
    board : BoardState;

    players: {
        'X' : string;
        'O' : string;
    };
    currentPlayer: PlayerSymbol;
    status: GameStatus;
    winner: PlayerSymbol | 'draw' | null ;
}

export interface statusPayload {
    message : string;
}