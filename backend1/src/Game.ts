import { WebSocket } from "ws";
import { Chess, Square } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE, WHITE, BLACK, TIME } from "./messages";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    public originalTimeControlW: number;
    public originalTimeControlB: number;
    private startTime: Date;
    private gameOver = false;
    private whiteTimeLeft: number;
    private blackTimeLeft: number;
    private activePlayer: "w" | "b";
    private interval: NodeJS.Timeout | null;
    private timeout = false;

    constructor(player1: WebSocket, player2: WebSocket, timeControlW: number, timeControlB: number) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.whiteTimeLeft = timeControlW; 
        this.blackTimeLeft = timeControlB;
        this.originalTimeControlW = timeControlW;
        this.originalTimeControlB = timeControlB;
        
        this.activePlayer = WHITE;
        this.interval = null;
        this.timeout = false;

        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: WHITE,
                whiteTimeLeft: this.whiteTimeLeft,
                blackTimeLeft: this.blackTimeLeft
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: BLACK,
                whiteTimeLeft: this.whiteTimeLeft,
                blackTimeLeft: this.blackTimeLeft
            }
        }));

        this.startTimer();
    }

    private startTimer() {
        this.startTime = new Date();
        this.interval = setInterval(() => {
            if (this.gameOver) {
                clearInterval(this.interval as NodeJS.Timeout);
                return;
            }
            const currentTime = new Date();
            const elapsedTime = Math.floor((currentTime.getTime() - this.startTime.getTime()) / 1000);

            console.log("Current active player: ", this.activePlayer);

            if (this.activePlayer === WHITE) {
                this.whiteTimeLeft -= elapsedTime;
                console.log("this.whiteTimeLeft: ", this.whiteTimeLeft);
                if (this.whiteTimeLeft <= 0) {
                    this.timeout = true;
                    this.handleGameStatus();
                }
            } else {
                this.blackTimeLeft -= elapsedTime;
                console.log("this.blackTimeLeft: ", this.blackTimeLeft);
                if (this.blackTimeLeft <= 0) {
                    this.timeout = true;
                    this.handleGameStatus();
                }
            }
            
            this.startTime = currentTime;
            this.broadcastTime();
        }, 1000); // 1000 milliseconds = 1 second
    }

    private broadcastTime() {
        const timePayload = {
            whiteTimeLeft: this.whiteTimeLeft,
            blackTimeLeft: this.blackTimeLeft,
            activePlayer: this.activePlayer
        };
        this.player1.send(JSON.stringify({
            type: TIME,
            payload: timePayload
        }));
        this.player2.send(JSON.stringify({
            type: TIME,
            payload: timePayload
        }));
    }

    setTimeControl(timeControl: number) {
        this.whiteTimeLeft = timeControl;
        this.blackTimeLeft = timeControl;
        this.broadcastTime();
    }

    stopTimers() {
        clearInterval(this.interval as NodeJS.Timeout);
        console.log("Timers stopped.")
    }

    makeMove(socket: WebSocket, move: { from: Square; to: Square; }) {
        // private gameOver variable to prevent further moves after parsing
        if (this.gameOver) return; 

        console.log("Received move: ", move, "from ", socket === this.player1 ? "player1" : "player2");
        const attemptedMove = this.board.move(move);

        if (attemptedMove) {
            const opponent = socket === this.player1 ? this.player2 : this.player1;
            opponent.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));

            this.activePlayer = this.activePlayer === WHITE ? BLACK : WHITE;
            console.log("this.activePlayer: ", this.activePlayer);

            if (this.board.isGameOver()) {
                this.gameOver = true;
                clearInterval(this.interval as NodeJS.Timeout);
                console.log("The game is over by: ");
                this.handleGameStatus();
            }
        }  // await  db.moves.push(move)
    }

    private handleGameStatus() {
        let winner = ""; 
        let reason = "";
        if (this.timeout) {
            console.log("Game over by Timeout.");
            this.gameOver = true;
            clearInterval(this.interval as NodeJS.Timeout);
            reason = " won by Timeout.";
            winner = this.board.turn() === WHITE ? "Black" : "White";
        } else if (this.board.isCheckmate()) {
            console.log("checkmate");
            reason = " won by Checkmate.";
            winner = this.board.turn() === WHITE ? "Black" : "White";
        } else if (this.board.isDraw()) {
            // if draw = T and im = F, then it is draw by 50 moves
            if (this.board.isInsufficientMaterial()) {
                console.log("insufficient material");
                reason = "Draw by insufficient material."
            } else {
                console.log("50 move rule");
                reason = "Draw by 50 move rule."
            }
        } else if (this.board.isThreefoldRepetition()) {
            console.log("3fold repetition");
            reason = "Draw by threefold repetition."
        } else {
            console.log("stalemate");
            reason = "Stalemate."
        }
        // broadcast game over reason to players
        this.player1.send(JSON.stringify({
            type: GAME_OVER,
            payload: { winner, reason }
        }));
        this.player2.send(JSON.stringify({
            type: GAME_OVER,
            payload: { winner, reason }
        }));
    }
}