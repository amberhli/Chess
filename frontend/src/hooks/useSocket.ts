import { useEffect, useState } from "react";

const backendWSUrl = import.meta.env.VITE_BACKEND_WS_URL;
console.log(backendWSUrl);

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket('wss://amberschess.com');
        ws.onopen = () => {
            setSocket(ws);
            console.log("ws on open");
        }
        ws.onclose = () => {
            setSocket(null);
        }
        return () => {
            ws.close();
        }

    }, [])

    return socket;
}