import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess, Color, PieceSymbol, Square } from 'chess.js'
import { INIT_GAME, MOVE, GAME_OVER, REMATCH, WHITE, BLACK, TIME, LOBBY_CREATED, LOBBY_ERROR } from "../../../backend1/src/messages.ts";
import  ChessClock from "../components/ChessClock";
import TimeControl from '../components/TimeControl';
import JoinLobby from "../components/JoinLobby.tsx";
import useSound from "use-sound";

export const Game = () => {
    const socket = useSocket();
    const [chess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [reason, setReason] = useState<string | null>(null);
    const [playerColor, setPlayerColor] = useState<"w" | "b">(WHITE);
    const [whiteTimeLeft, setWhiteTimeLeft] = useState<number>(600);
    const [blackTimeLeft, setBlackTimeLeft] = useState<number>(600);
    const [activePlayer, setActivePlayer] = useState<"w" | "b">(WHITE);
    const [modalClosed, setModalClosed] = useState(false); 
    const [privateLobby, setPrivateLobby] = useState(false); 
    const [lobbyCode, setLobbyCode] = useState<string | null>(null);
    const [displayLobbyCode, setDisplayLobbyCode] = useState(false);
    const [joinPrivate, setJoinPrivate] = useState(false);
    const [createPrivate, setCreatePrivate] = useState(false);

    /* SOUND EFFECTS */
    const [playStart] = useSound('/notify.mp3', { volume: 0.25 });
    const [playMove] = useSound('/move-self.mp3', { volume: 0.25 });
    const [playCapture] = useSound('/capture.mp3', { volume: 0.25 });
    const [playCheck] = useSound('/move-check.mp3', { volume: 0.25 });
    const [playCastle] = useSound('/castle.mp3', { volume: 0.25 });

    useEffect(() => {
        if (!socket) return;
        
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case INIT_GAME:
                    chess.reset(); // in case a REMATCH is requested
                    playStart();
                    setBoard(chess.board());
                    setStarted(true);
                    setGameOver(false);
                    setWinner(null);
                    setPlayerColor(message.payload.color);
                    setWhiteTimeLeft(message.payload.whiteTimeLeft);
                    setBlackTimeLeft(message.payload.blackTimeLeft);
                    setActivePlayer(WHITE); 
                    setModalClosed(false);
                    setPrivateLobby(false);
                    setDisplayLobbyCode(false);
                    break;
                case MOVE:
                    const move = message.payload;
                    console.log("Move made: ", move);
                    let moveMade;
                    moveMade = chess.move(move);
                    console.log("MoveMade: ", moveMade);
                    setBoard(chess.board());
                    handleMoveMade(moveMade);
                    break;
                case GAME_OVER:
                    setGameOver(true);
                    setWinner(message.payload.winner);
                    setReason(message.payload.reason);
                    break;
                case TIME:
                    setWhiteTimeLeft(message.payload.whiteTimeLeft);
                    setBlackTimeLeft(message.payload.blackTimeLeft);
                    setActivePlayer(message.payload.activePlayer);
                    break;
                case LOBBY_CREATED:
                    console.log("Lobby created and code displayed.")
                    setLobbyCode(message.payload.code);
                    setDisplayLobbyCode(true);
                    break;
                case LOBBY_ERROR:
                    alert(message.payload.message);
                    break;
                default:
                    break;
            }
        };
    }, [socket, chess]);

    const navigate = useNavigate();
    const handleReturnHome = () => {
        navigate("/");
    };

    const handleRematch = () => {
        if (socket) {
            socket.send(JSON.stringify({
                type: REMATCH
            }));
        }
    };

    const setClockTimeW = (time: number) => {
        setWhiteTimeLeft(time);
    };

    const setClockTimeB = (time: number) => {
        setBlackTimeLeft(time);
    };

    const handleMoveMade = (moveMade: { color?: Color; from?: Square; to?: Square; piece?: PieceSymbol; captured?: PieceSymbol | undefined; promotion?: PieceSymbol | undefined; flags: any; san: any; lan?: string; before?: string; after?: string; }) => {
        console.log("inside handleMoveMade", moveMade);
        if (moveMade.flags && moveMade.flags.includes('c')) {
            playCapture();
            console.log("capture sound effect played");
        } else if (moveMade.san && moveMade.san.includes('O-O')) {
            playCastle();
            console.log("castle sound effect played");
        } else if (chess.inCheck()) {
            playCheck();
            console.log("check sound effect played");
        } else {
            playMove();
            console.log("move sound effect played");
        }
    };

    if(!socket) return <div className="h-screen pt-10 justify-center flex">
        <div className = "text-center text-2xl">
            <p className="text-dark-pink">
                Connecting...
            </p>
        </div>
     </div>;

    // overall padding is 32px, height of 2xl font line is 32px, height of in btwn padding is 16px
    // (32*2)+(32*2)+(16*2) = 160px
    return <div className="h-full p-8">
        <div className="h-full justify-center flex flex-col md-lg:flex-row space-y-6 space-x-0 md-lg:space-y-0 md-lg:space-x-8 lg:space-x-10 xl:space-x-12 2xl:space-x-14">
            <div style={{ width: "calc(100vh - 160px)" }} className="h-full md-lg:w-full md-lg:mx-0 mx-auto ">
                <div className="h-full flex flex-col space-y-4">
                    <div className="flex justify-end">
                        <ChessClock 
                            timeLeft={blackTimeLeft}
                            isActive={activePlayer === BLACK && started && !gameOver}
                        />
                    </div>
                    <div className="flex justify-end">
                        <ChessBoard 
                            chess={chess} 
                            setBoard={setBoard} 
                            socket={socket} 
                            board={board} 
                            started={started && !gameOver}
                            playerColor={playerColor}
                            onMoveMade={handleMoveMade}
                        />
                    </div>
                    <div className="flex justify-end">
                        <ChessClock 
                            timeLeft={whiteTimeLeft}
                            isActive={activePlayer === WHITE && started && !gameOver}
                        />
                    </div>
                </div>
            </div>
            
            {/* SIDEBAR */}
            <div className="h-full w-full md-lg:w-2/6 bg-medium-gray rounded-sm p-8 md-lg:pt-16 md-lg:pb-16 md-lg:pl-10 md-lg:pt-10">
                {/* RANDOM GAME USER INTERFACE */}
                {!started && !modalClosed && !privateLobby && !lobbyCode && (
                    <div className="w-full">
                        <Button onClick={() => {
                            socket.send(JSON.stringify({
                                type: INIT_GAME,
                                payload: whiteTimeLeft
                            }));
                        }} className="w-full items-center mb-4">
                            Play Random
                        </Button>
                        <Button onClick={() => {setPrivateLobby(true);}}
                            className="w-full items-center">
                            Play Private
                        </Button>
                    </div>
                )}
                
                {/* PRIVATE LOBBY NAVIGATION */}
                {!started && !modalClosed && privateLobby && !createPrivate && !joinPrivate && (
                    <div className="w-full">
                    <button
                    onClick={() => setPrivateLobby(false)}
                    className="bg-dark-gray rounded text-white text-md block px-4 hover:bg-darkest-gray mb-4">
                    ←
                    </button>
                    <Button onClick={() => {setCreatePrivate(true)}} 
                        className="w-full items-center mb-4">
                        Create Lobby
                    </Button>
                    <Button onClick={() => {setJoinPrivate(true);}}
                        className="w-full items-center mb-4">
                        Join Lobby
                    </Button>
                </div>
                )}
                {/* CREATE PRIVATE LOBBY */}
                {!started && !modalClosed && privateLobby && createPrivate && !displayLobbyCode && (
                    <div className="w-full">
                        <button
                        onClick={() => setCreatePrivate(false)}
                        className="bg-dark-gray rounded text-white text-md block px-4 hover:bg-darkest-gray mb-4">
                        ←
                        </button>
                        <div className="w-full">
                            <TimeControl 
                            socket={socket}
                            setClockTimeW={setClockTimeW}
                            setClockTimeB={setClockTimeB}
                            />
                        </div>
                    </div>
                )} 
                {!started && !modalClosed && privateLobby && createPrivate && displayLobbyCode && (
                    <div className="h-full w-full justify-center flex">
                        <p className="text-2xl text-center font-bold text-light-pink">
                            Lobby Code: {lobbyCode}
                        </p>
                    </div>
                )} 
                {/* JOIN PRIVATE LOBBY */}
                {!started && !modalClosed && privateLobby && joinPrivate && (
                    <div className="w-full">
                        <button
                        onClick={() => setJoinPrivate(false)}
                        className="bg-dark-gray rounded text-white text-md block px-4 hover:bg-darkest-gray mb-4">
                        ←
                        </button>
                        <JoinLobby
                        socket={socket}
                        />
                    </div>
                )} 

                {/* GAME OVER STATEMENTS */}
                {modalClosed && (
                    <div className="h-full w-full flex flex-col justify-between">   
                        <p className="text-light-pink text-center text-2xl">
                            {winner} {reason}
                        </p>
                        <div className="flex md-lg:flex-col space-x-4 space-y-0 md-lg:space-x-0 md-lg:space-y-4">
                            <Button onClick={handleRematch} className="w-full items-center">
                                Rematch
                            </Button>
                            <Button onClick={handleReturnHome} className="w-full items-center">
                                Return Home
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div> 

        {/* GAME OVER MODAL POPUP */}
        {gameOver && (
            <div id="game-over-modal" className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 md:p-5 md:max-w-lg">
                    <div className="flex justify-between border-b-2 pb-2 mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Game Over
                        </h3>
                        <button className="text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => {
                            setGameOver(false);
                            setModalClosed(true);
                            }}>
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-dark-pink text-center text-2xl mt-5 mb-5">
                        {winner} {reason}
                    </p>
                    {/* TODO: add gif here */}
                    <div className="flex justify-evenly space-x-4">
                    <Button onClick={handleRematch} className="w-full">
                        Rematch
                    </Button>
                    <Button onClick={handleReturnHome} className="text-nowrap w-full">
                        Return Home
                    </Button>
                    </div>
                </div>
            </div>
        )}
         
    </div>;
}