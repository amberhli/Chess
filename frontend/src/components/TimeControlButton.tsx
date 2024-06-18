import { FC } from 'react';

interface TimeControlButtonProps {
    time: number;
    handleTimeSelect: (time: number) => void;
    label: string;
}

const TimeControlButton: FC<TimeControlButtonProps> = ({ time, handleTimeSelect, label }) => {
    return <div className="w-full">
        <button 
            type="button"
            onClick={() => handleTimeSelect(time)} 
            className="bg-dark-gray hover:bg-darkest-gray text-white text-sm w-full block px-2 py-2 rounded focus:ring-4 focus:outline-none focus:ring-dark-pink"
        >
            {label}
        </button>
    </div>
};


export default TimeControlButton;