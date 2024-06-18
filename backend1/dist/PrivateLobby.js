"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateLobby = void 0;
class PrivateLobby {
    constructor(code, player1, timeControlW, timeControlB) {
        this.code = code;
        this.player1 = player1;
        this.player2 = null;
        this.timeControlW = timeControlW;
        this.timeControlB = timeControlB;
        this.game = null;
    }
    joinLobby(player2) {
        if (!this.player2) {
            this.player2 = player2;
            console.log("Lobby joined successfully.");
            return true;
        }
        return false;
    }
}
exports.PrivateLobby = PrivateLobby;
