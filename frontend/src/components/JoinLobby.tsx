import React, { useState } from 'react';
import { JOIN_LOBBY } from '../../../backend1/src/messages.ts';

interface JoinLobbyProps {
    socket: WebSocket | null;
}

const JoinLobby: React.FC<JoinLobbyProps> = ({ socket }) => {
    const [lobbyCodePrompt, setLobbyCodePrompt] = useState<string>("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLobbyCodePrompt(event.target.value);
    };

    const handleJoinClick = () => {
        if (lobbyCodePrompt.length === 5) {
            if (socket) {
                socket.send(JSON.stringify({
                    type: JOIN_LOBBY,
                    payload: {
                        code: lobbyCodePrompt
                    }
                }));
            }
        }   else {
            alert('Lobby code must be 5 characters long.');
        }
    };

    return <div className="w-full">
        <div className="flex flex-row items-center">
            <input
                type="text"
                value={lobbyCodePrompt}
                onChange={handleInputChange}
                maxLength={5}
                className="w-full bg-white pl-3 py-2 mr-3 rounded-md text-sm focus:outline-none focus:ring-4 focus:ring-dark-pink"
                placeholder="Enter code"
            />
            <button 
                onClick={handleJoinClick} 
                className="bg-dark-gray rounded text-white text-md block px-2 py-1 hover:bg-darkest-gray">
                    Join
            </button>
        </div>
    </div>

    
};

export default JoinLobby;