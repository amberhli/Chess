"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
// Initialize the Express app
const app = (0, express_1.default)();
// Serve static files from the React app
app.use(express_1.default.static(path_1.default.join(__dirname, 'build')));
// Catch-all to serve the React app for any other routes
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'build', 'index.html'));
});
// Start the Express server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const wss = new ws_1.WebSocketServer({ server });
const gameManager = new GameManager_1.GameManager();
wss.on('connection', function connection(ws) {
    console.log("WebSocket connection established");
    gameManager.addUser(ws);
    ws.on("close", () => {
        gameManager.removeUser(ws);
        console.log("WebSocket connection removed");
    });
});
