import { Color, PieceSymbol, Square } from "chess.js";
import { memo, useCallback, useState } from "react";
import { MOVE } from "../../../backend1/src/messages.ts";

export const ChessBoard = memo(({ chess, board, socket, setBoard, started, playerColor, onMoveMade }: {
    chess: any;
    setBoard: any;
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
    started: boolean;
    playerColor: "w" | "b";
    onMoveMade: (move: { color?: Color; from?: Square; to?: Square; piece?: PieceSymbol; captured?: PieceSymbol | undefined; promotion?: PieceSymbol | undefined; flags: any; san: any; lan?: string; before?: string; after?: string; }) => void;
}) => {
    const [from, setFrom] = useState<null | Square>(null);

    const handleSquareClick = useCallback((squareRepresentation: Square) => {
        // ignore clicks if: 
        if (!started) return;

        // If clicking on own piece, change 'from' to new selected piece
        const piece = chess.get(squareRepresentation);
        if (piece && piece.color === playerColor) {
            setFrom(squareRepresentation);
            return;  
        }

        // Make move with selected piece
        if (from) {
            const move = {
                from,
                to: squareRepresentation
            };

            // Check move validity without making move
            const moves = chess.moves({ square: from, verbose: true });
            const validMove = moves.some((m: { to: string; }) => m.to === squareRepresentation);

            if (!validMove) {
                // Invalid move: reset selected piece
                setFrom(null);
            } else {
                // Valid move: send move to server
                socket.send(JSON.stringify({
                    type: MOVE,
                    payload: {
                        move,
                    }
                }));
                let moveMade;
                moveMade = chess.move(move);
                setBoard(chess.board());
                setFrom(null);
                onMoveMade(moveMade);
            }
        }
    }, [chess, from, setFrom, setBoard, socket, started, playerColor, onMoveMade]);

    return (
        <div className="h-full flex justify-center items-center">
            <div className="grid grid-cols-8 grid-rows-8 w-full gap-0">
                {board.map((row, i) => (
                    row.map((square, j) => {
                        const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square;
                        const isSelected = from === squareRepresentation;
                        const isDarkSquare = (i + j) % 2 !== 0;
                        const squareColor = isSelected 
                            ? 'bg-highlight-pink' 
                            : isDarkSquare 
                            ? 'bg-dark-pink' 
                            : 'bg-light-pink';
                        return (
                            <div 
                                onClick={() => handleSquareClick(squareRepresentation)} 
                                key={`${i}-${j}`} 
                                className={`relative ${squareColor} flex justify-center items-center`}
                                style={{ aspectRatio: '1' }}
                            >
                                {square && ( 
                                    <img 
                                        className="w-piece-ratio h-piece-ratio object-contain" 
                                        src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`}
                                    />
                                )}
                            </div>
                        );
                    })
                ))}
            </div>
        </div>
    );
});