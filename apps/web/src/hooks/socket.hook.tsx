import { Socket, io } from "socket.io-client";
import React, {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useState,
} from "react";
import { useAppSelector } from "../store";
import { env } from "../lib/utils";

// socket context to hold the instance of sockets
const SocketContext = createContext<{
    socket: Socket | null;
}>({
    socket: null,
});

const backendURL = env.VITE_BACKEND_HOST;

// socket provider to wrap the app to get the socket
const SocketProvider = ({
    children,
    streamId,
}: PropsWithChildren<{
    streamId?: string;
}>) => {
    // fetch the user from the server
    const user = useAppSelector((state) => state.app.user);

    // socket state var
    const [socket, setSocket] = useState<Socket | null>(null);

    /**
     * @description handler to make connection to socket and setting socket to the current state
     * to access all over inside the wrapper
     */
    const handleConnectSocket = useCallback(() => {
        const socketClient = io(backendURL, {
            withCredentials: true, // by setting true it will send secure cookies from the client to the server
            autoConnect: true, // debug code (default it is true) which will try to connect which no need to call socketClient.connect(), it will call as soon as this will run
            query: {
                streamId,
            },
            transports: ["websocket", "webtransport"],
        });
        setSocket(socketClient);
        return socketClient;
    }, [io, setSocket, backendURL, streamId]);

    // run as soon as page load trigger
    React.useEffect(() => {
        const nSocket = handleConnectSocket();

        return () => {
            nSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

// use useSocket to access socket context in your app
const useSocket = () => {
    const socketClient = useContext(SocketContext);
    if (!socketClient)
        /**
         * Will throw an error if forget to wrap your app inside SocketProvider
         * or typing to use if outside the wrapper
         */
        throw new Error(
            "It seems you forgot to wrap your app inside SocketProvider!"
        );

    return socketClient;
};

// exporting the provider and sockets
export { SocketProvider, useSocket };
