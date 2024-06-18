import { WebSocket } from "ws";
import { Game } from "./Game";

export class PrivateLobby {
    public code: string;
    public player1: WebSocket | null;
    public player2: WebSocket | null;
    public timeControlW: number;
    public timeControlB: number;
    public game: Game | null;

    constructor(code: string, player1: WebSocket, timeControlW: number, timeControlB: number) {
        this.code = code;
        this.player1 = player1;
        this.player2 = null;
        this.timeControlW = timeControlW;
        this.timeControlB = timeControlB;
        this.game = null;
    }

    joinLobby(player2: WebSocket) {
        if (!this.player2) {
            this.player2 = player2;
            console.log("Lobby joined successfully.")
            return true;
        }
        return false;
    }
}