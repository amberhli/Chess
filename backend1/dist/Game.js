"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2, timeControlW, timeControlB) {
        this.gameOver = false;
        this.timeout = false;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.whiteTimeLeft = timeControlW;
        this.blackTimeLeft = timeControlB;
        this.originalTimeControlW = timeControlW;
        this.originalTimeControlB = timeControlB;
        this.activePlayer = messages_1.WHITE;
        this.interval = null;
        this.timeout = false;
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: messages_1.WHITE,
                whiteTimeLeft: this.whiteTimeLeft,
                blackTimeLeft: this.blackTimeLeft
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: messages_1.BLACK,
                whiteTimeLeft: this.whiteTimeLeft,
                blackTimeLeft: this.blackTimeLeft
            }
        }));
        this.startTimer();
    }
    startTimer() {
        this.startTime = new Date();
        this.interval = setInterval(() => {
            if (this.gameOver) {
                clearInterval(this.interval);
                return;
            }
            const currentTime = new Date();
            const elapsedTime = Math.floor((currentTime.getTime() - this.startTime.getTime()) / 1000);
            console.log("Current active player: ", this.activePlayer);
            if (this.activePlayer === messages_1.WHITE) {
                this.whiteTimeLeft -= elapsedTime;
                console.log("this.whiteTimeLeft: ", this.whiteTimeLeft);
                if (this.whiteTimeLeft <= 0) {
                    this.timeout = true;
                    this.handleGameStatus();
                }
            }
            else {
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
    broadcastTime() {
        const timePayload = {
            whiteTimeLeft: this.whiteTimeLeft,
            blackTimeLeft: this.blackTimeLeft,
            activePlayer: this.activePlayer
        };
        this.player1.send(JSON.stringify({
            type: messages_1.TIME,
            payload: timePayload
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.TIME,
            payload: timePayload
        }));
    }
    setTimeControl(timeControl) {
        this.whiteTimeLeft = timeControl;
        this.blackTimeLeft = timeControl;
        this.broadcastTime();
    }
    stopTimers() {
        clearInterval(this.interval);
        console.log("Timers stopped.");
    }
    makeMove(socket, move) {
        // private gameOver variable to prevent further moves after parsing
        if (this.gameOver)
            return;
        console.log("Received move: ", move, "from ", socket === this.player1 ? "player1" : "player2");
        const attemptedMove = this.board.move(move);
        if (attemptedMove) {
            const opponent = socket === this.player1 ? this.player2 : this.player1;
            opponent.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
            this.activePlayer = this.activePlayer === messages_1.WHITE ? messages_1.BLACK : messages_1.WHITE;
            console.log("this.activePlayer: ", this.activePlayer);
            if (this.board.isGameOver()) {
                this.gameOver = true;
                clearInterval(this.interval);
                console.log("The game is over by: ");
                this.handleGameStatus();
            }
        } // await  db.moves.push(move)
    }
    handleGameStatus() {
        let winner = "";
        let reason = "";
        if (this.timeout) {
            console.log("Game over by Timeout.");
            this.gameOver = true;
            clearInterval(this.interval);
            reason = " won by Timeout.";
            winner = this.board.turn() === messages_1.WHITE ? "Black" : "White";
        }
        else if (this.board.isCheckmate()) {
            console.log("checkmate");
            reason = " won by Checkmate.";
            winner = this.board.turn() === messages_1.WHITE ? "Black" : "White";
        }
        else if (this.board.isDraw()) {
            // if draw = T and im = F, then it is draw by 50 moves
            if (this.board.isInsufficientMaterial()) {
                console.log("insufficient material");
                reason = "Draw by insufficient material.";
            }
            else {
                console.log("50 move rule");
                reason = "Draw by 50 move rule.";
            }
        }
        else if (this.board.isThreefoldRepetition()) {
            console.log("3fold repetition");
            reason = "Draw by threefold repetition.";
        }
        else {
            console.log("stalemate");
            reason = "Stalemate.";
        }
        // broadcast game over reason to players
        this.player1.send(JSON.stringify({
            type: messages_1.GAME_OVER,
            payload: { winner, reason }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.GAME_OVER,
            payload: { winner, reason }
        }));
    }
}
exports.Game = Game;
