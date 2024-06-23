import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button";

export const Landing = () => {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const navigate = useNavigate();
    return <div className="h-full p-8">
        <div className="h-full justify-center flex flex-col md-lg:flex-row space-y-6 space-x-0 md-lg:space-y-0 md-lg:space-x-8 lg:space-x-10 xl:space-x-12 2xl:space-x-14">
            <div style={ screenWidth > screenHeight ? {width: "calc(100vh - 160px)" } : {} } className="h-full md-lg:w-full md-lg:mx-0 mx-auto">
                <div className="w-full mt-11">
                    <img src={"/chessboard.png"}/>
                </div>
            </div>
            <div className="h-full w-full md-lg:w-2/6 flex flex-col justify-center">
                <div className=" flex flex-col items-center justify-center">
                    <h1 className="md-lg:text-3xl lg:text-4xl text-4xl font-bold text-white text-nowrap text-center">
                        Play Chess Online!
                    </h1>
                    <div className="mt-4 flex justify-center">
                        <Button onClick={() => {
                            navigate("/play");
                        }} >
                            Play Online
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}