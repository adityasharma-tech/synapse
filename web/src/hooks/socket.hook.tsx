import socketio, { Socket } from "socket.io-client";
import React, { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";
import { useAppSelector } from "../store";

// socket context to hold the instance of sockets
const SocketContext = createContext<null | {}>(null)


// socket provider to wrap the app to get the socket
const SocketProvider = ({ children }: PropsWithChildren) => {

    // fetch the user from the server
    const user = useAppSelector(state=>state.app.user);

    // socket state var
    const [socket, setSocket] = useState<Socket | null>(null);
    
    const handleConnectSocket = useCallback(()=>{
        const socketClient = socketio(import.meta.env.VITE_SOCKET_URI, {
            withCredentials: true
        })
        setSocket(socketClient);
    }, [socketio, setSocket])

    
    React.useEffect(()=>{
        handleConnectSocket()
    }, [user])

    
    return <SocketContext.Provider value={{ socket }}>
        {children}
    </SocketContext.Provider>
}


// use useSocket to access socket context in your app
const useSocket = () => {
    const socketClient = useContext(SocketContext);
    if (!socketClient)
        throw new Error("It seems you forgot to wrap your app inside SocketProvider!")

    return socketClient;
}


// exporting the provider and sockets
export {
    SocketProvider,
    useSocket
}