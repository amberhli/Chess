import express from 'express';
import path from 'path';
import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

// Initialize the Express app
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all to serve the React app for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the Express server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    console.log("WebSocket connection established");
    gameManager.addUser(ws) 
    ws.on("close", () => {
        gameManager.removeUser(ws);
        console.log("WebSocket connection removed");
    });
}); 