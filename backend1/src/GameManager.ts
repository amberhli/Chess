import { WebSocket } from "ws";
import { INIT_GAME, MOVE, REMATCH, CREATE_LOBBY, LOBBY_CREATED, JOIN_LOBBY, LOBBY_ERROR } from "./messages";
import { Game } from "./Game";
import { PrivateLobby } from "./PrivateLobby";

// need a User, Game class

export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];
    private timeControl: number; 
    private lobbies: Map<string, PrivateLobby>;

    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
        this.timeControl = 600;
        this.lobbies = new Map();
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket);
        const gamesToRemove = this.games.filter(game => game.player1 === socket || game.player2 === socket);
        gamesToRemove.forEach(game => {
            game.stopTimers(); // Stop the game timers
            this.games = this.games.filter(g => g !== game);
        });

        this.lobbies.forEach((lobby, code) => {
            if (lobby.player1 === socket || lobby.player2 === socket) {
                this.lobbies.delete(code);
            }
        });
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            console.log("Received message: ", message);

            if (message.type === INIT_GAME) {
                if (this.pendingUser) { // start a game 
                    const game = new Game(this.pendingUser, socket, message.payload, message.payload);
                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = socket;
                }
            }

            if (message.type === MOVE) {
                console.log("MOVE message move: ", message.payload.move);
                const game = this.findGameBySocket(socket);
                if (game) {
                    game.makeMove(socket, message.payload.move);
                }
            }

            if (message.type === REMATCH) {
                console.log("REMATCH requested");
                const game = this.findGameBySocket(socket);
                if (game) {
                   const player1 = game.player1;
                   const player2 = game.player2;
                   const timeControlW = game.originalTimeControlW;
                   const timeControlB = game.originalTimeControlB;
                   console.log("In rematch, starting new game with this.timeControl: ", this.timeControl);
                   const newGame = new Game(player2, player1, timeControlB, timeControlW);
                   this.games = this.games.filter(g => g !== game);
                   this.games.push(newGame);
                   console.log("REMATCH started with swapped colors");
                }
            }

            if (message.type === CREATE_LOBBY) {
                console.log("New Lobby created.");
                const lobbyCode = this.generateLobbyCode();
                console.log("Lobby code is: ", lobbyCode);
                const timeControlW = message.payload.timeControlW || this.timeControl;
                const timeControlB = message.payload.timeControlB || this.timeControl;
                console.log("White time control set as: ", timeControlW, "Black time control set as: ", timeControlB);
                const lobby = new PrivateLobby(lobbyCode, socket, timeControlW, timeControlB);
                this.lobbies.set(lobbyCode, lobby);
                socket.send(JSON.stringify({ 
                    type: LOBBY_CREATED, 
                    payload: { 
                        code: lobbyCode 
                    } 
                }));
            }

            if (message.type === JOIN_LOBBY) {
                console.log("Inside Join Lobby.")
                const lobbyCode = message.payload.code; // local var
                const lobby = this.lobbies.get(lobbyCode); // grabbing privlobby object if lobbycode exists
                if (lobby && lobby.joinLobby(socket)) { // if privlobby obj exists and
                    const game = new Game(lobby.player1!, lobby.player2!, lobby.timeControlW, lobby.timeControlB);
                    this.games.push(game);
                    console.log("Game started for lobby code: ", lobbyCode);
                    this.lobbies.delete(lobbyCode);
                } else {
                    socket.send(JSON.stringify({ 
                        type: LOBBY_ERROR, 
                        payload: {
                            message: "Invalid lobby code, or lobby is full." 
                        } 
                    }));
                }
            } 
        });
    }

    private findGameBySocket(socket: WebSocket): Game | undefined {
        return this.games.find(game => game.player1 === socket || game.player2 === socket);
    }

    private generateLobbyCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}