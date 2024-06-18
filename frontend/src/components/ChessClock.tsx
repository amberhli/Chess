import React from 'react';

interface ChessClockProps {
    timeLeft: number; // Time left in seconds
    isActive: boolean;
}

const formatTime = (time: number): string => {
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = time % 60;

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else if (mins > 0) {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `0:${secs.toString().padStart(2, '0')}`;
    }
};

export const ChessClock: React.FC<ChessClockProps> = ({ timeLeft, isActive }) => {
    const clockStyle = isActive ? "bg-white text-black" : "bg-stone-400 text-neutral-600";
    
    return (
        <div id="chessclock" className={`h-[32px] w-[100px] bg-white shadow rounded-sm ${clockStyle}`}>
            <div className="text-2xl mr-1 text-right">
                {formatTime(timeLeft)}
            </div>
        </div>
    );
};

export default ChessClock;