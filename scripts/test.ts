const wsUrl = "ws://localhost:5174/socket.io/";

let connectionStartTime: number | null = null;
let connectionInterval: NodeJS.Timeout | null = null;

const socket = new WebSocket(wsUrl);

socket.onopen = () => {
    connectionStartTime = Date.now();
    console.log(
        `[CONNECTED] WebSocket connection established at ${new Date(connectionStartTime).toLocaleTimeString()}`
    );

    connectionInterval = setInterval(() => {
        if (connectionStartTime) {
            const duration = Math.floor(
                (Date.now() - connectionStartTime) / 1000
            );
            console.log(`[STATUS] Connected for ${duration} seconds`);
        }
    }, 1000);
};

socket.onclose = () => {
    if (connectionInterval) clearInterval(connectionInterval);
    if (connectionStartTime) {
        const totalDuration = Math.floor(
            (Date.now() - connectionStartTime) / 1000
        );
        console.log(
            `[DISCONNECTED] Total connection duration: ${totalDuration} seconds`
        );
    } else {
        console.log(`[DISCONNECTED] Connection was not established`);
    }
};

socket.onerror = (err) => {
    console.error("[ERROR] WebSocket encountered an error:", err);
};
