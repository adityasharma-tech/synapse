import { useRef } from "react";
import ChatComponent from "./chat-comp";
import VideoComponent from "./video-comp";

export default function StreamV2() {
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const videoWindowRef = useRef<HTMLDivElement>(null);
    return (
        <div className="bg-neutral-950 h-full flex flex-col md:flex-row p-3 gap-y-3">
            <div ref={videoWindowRef} className="h-1/3 md:w-3/5 md:h-full mr-3">
                <VideoComponent />
            </div>
            <div
                ref={chatWindowRef}
                aria-expanded={"true"}
                className="h-2/3 aria-[expanded='false']:w-0 aria-[expanded='false']:overflow-hidden md:w-2/5 md:h-full"
            >
                <ChatComponent
                    chatWindowRef={chatWindowRef}
                    videoWindowRef={videoWindowRef}
                />
            </div>
        </div>
    );
}
