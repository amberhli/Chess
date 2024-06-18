import React, { FC } from 'react';

interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string; // Allow className as an optional prop
}

export const Button: FC<ButtonProps> = ({ onClick, children, className }) => {
    return <div className="w-full">
        <button onClick={onClick} className={
        `bg-dark-pink hover:bg-darker-pink text-white 
        font-bold py-2 md:py-4 px-6 md:px-8 lg:px-10 rounded ${className}`}>
            {children}
        </button>
    </div>
};