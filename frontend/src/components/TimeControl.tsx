import React, { useState } from "react";
import { CREATE_LOBBY } from '../../../backend1/src/messages.ts';
import TimeControlButton from "./TimeControlButton.tsx";
import { Button } from "./Button.tsx";

// TODO: increase size of time control dropdown

interface TimeControlProps {
    socket: WebSocket | null;
    setClockTimeW: (time: number) => void;
    setClockTimeB: (time: number) => void;
}

const TimeControl: React.FC<TimeControlProps> = ({ socket, setClockTimeW, setClockTimeB }) => {
    const [customTimeW, setCustomTimeW] = useState<string>("");
    const [customTimeB, setCustomTimeB] = useState<string>("");
    const [selectedTimeW, setSelectedTimeW] = useState<number>(600); // Default to 10 minutes
    const [selectedTimeB, setSelectedTimeB] = useState<number>(600); // Default to 10 minutes
    const [isOpen, setIsOpen] = useState(false);

    const handleTimeSelect = (time: number) => {
        setClockTimeW(time);
        setClockTimeB(time);
        setSelectedTimeW(time);
        setSelectedTimeB(time);
    };

    const handleCustomTimeChangeW = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCustomTimeW(event.target.value);
    };
    const handleCustomTimeChangeB = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCustomTimeB(event.target.value);
    };

    const handleCustomTimeKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const timeW = parseInt(customTimeW, 10);
            const timeB = parseInt(customTimeB, 10);    
            if (!isNaN(timeW) && !isNaN(timeB) && timeW > 0 && timeB > 0 && timeW < 24 && timeB < 24) {
                setClockTimeW(timeW * 60);
                setClockTimeB(timeB * 60);
                setSelectedTimeW(timeW * 60);
                setSelectedTimeB(timeB * 60);
            } else if (isNaN(timeW) || isNaN(timeB)) {
                alert('Please enter valid numbers for the custom time control.');
            } else {
                alert('Please enter times between 0-24 hours.');
            }
        }
    };

    const handleCreateGame = () => {
        console.log("inside handle create game.");
        if (socket) {
            socket.send(JSON.stringify({
                type: CREATE_LOBBY,
                payload: {
                    timeControlW: selectedTimeW,
                    timeControlB: selectedTimeB
                },
            }));
        }
    };

    return <div className="relative inline-block text-center w-full">
        <div className="flex justify-between w-full mb-4">
            <button
                id="multilevelDropdownButton"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white bg-dark-gray hover:bg-darkest-gray font-medium rounded-lg text-sm px-5 py-4 text-center inline-flex items-center w-full"
                aria-haspopup="true" 
                aria-expanded={isOpen ? "true" : "false"} 
            >
                Time Control
                <svg
                    className="w-2.5 h-2.5 ms-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                    />  
                </svg>
            </button>
        </div>
        {isOpen && (
            <div 
                id="multi-dropdown" 
                className="w-full relative" // w-44
                style={{ top: "100%", left: 0 }}
                aria-labelledby="multiLevelDropdownButton"
            >
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <TimeControlButton 
                        time={60} 
                        handleTimeSelect={handleTimeSelect} 
                        label="1 min" 
                    />
                    <TimeControlButton 
                        time={180} 
                        handleTimeSelect={handleTimeSelect} 
                        label="3 min" 
                    />
                    <TimeControlButton 
                        time={300} 
                        handleTimeSelect={handleTimeSelect} 
                        label="5 min" 
                    />
                    <TimeControlButton 
                        time={600} 
                        handleTimeSelect={handleTimeSelect} 
                        label="10 min" 
                    />
                    <TimeControlButton 
                        time={1800} 
                        handleTimeSelect={handleTimeSelect} 
                        label="30 min" 
                    />
                    <TimeControlButton 
                        time={3600} 
                        handleTimeSelect={handleTimeSelect} 
                        label="60 min" 
                    />
                </div>
                <div className="w-full mb-4">
                    <div className="flex">
                        <label className="mt-1 justify-start text-white text-sm mr-2">
                            Custom:
                        </label>
                        <div className="flex flex-row md-lg:flex-col">
                            <input
                                type="text"
                                value={customTimeW}
                                onChange={handleCustomTimeChangeW}
                                onKeyPress={handleCustomTimeKeyPress}
                                className="w-full bg-white pl-3 py-1 rounded-md text-sm focus:outline-none focus:ring-4 focus:ring-dark-pink md-lg:mb-2 mr-2"
                                placeholder="Enter time for White"
                            />
                            <input
                                type="text"
                                value={customTimeB}
                                onChange={handleCustomTimeChangeB}
                                onKeyPress={handleCustomTimeKeyPress}
                                className="w-full bg-white pl-3 py-1 rounded-md text-sm focus:outline-none focus:ring-4 focus:ring-dark-pink"
                                placeholder="Enter time for Black"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}
        <Button onClick={handleCreateGame} className="w-full items-center mb-4">
            Create Game
        </Button>
    </div>
};
    
export default TimeControl;