import { Socket, io } from "socket.io-client";
import React, { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";
import { useAppSelector } from "../store";

// socket context to hold the instance of sockets
const SocketContext = createContext<{
    socket: Socket | null
}>({
    socket: null
})

const backendURL = import.meta.env.VITE_BACKEND_HOST;


// socket provider to wrap the app to get the socket
const SocketProvider = ({ children }: PropsWithChildren) => {

    // fetch the user from the server
    const user = useAppSelector(state=>state.app.user);

    // socket state var
    const [socket, setSocket] = useState<Socket | null>(null);
    
    const handleConnectSocket = useCallback(()=>{
        const socketClient = io(backendURL, {
            withCredentials: true,
            // transports: ["websockets"],
            autoConnect: true
        })
        setSocket(socketClient);
    }, [io, setSocket])

    
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