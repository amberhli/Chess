import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    console.log("WebSocket connection established");
    gameManager.addUser(ws) 
    ws.on("close", () => {
        gameManager.removeUser(ws);
        console.log("WebSocket connection removed");
    });
}); 