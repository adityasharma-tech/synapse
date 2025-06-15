import LoadingComp from "@/components/loading";
import React, { Suspense, useState } from "react";
const ChatComponent = React.lazy(() => import("./chat-comp"));
const VideoComponent = React.lazy(() => import("./video-comp"));

export default function StreamV2() {
    const [chatOpen, setChatOpen] = useState(true);
    return (
        <div
            data-chat-open={chatOpen}
            className="bg-neutral-950 h-full flex flex-col md:flex-row p-3 gap-y-3"
        >
            <div
                data-chat-open={chatOpen}
                className="h-1/3 data-[chat-open=false]:w-full data-[chat-open=false]:mr-0 md:w-3/5 md:h-full mr-3"
            >
                <Suspense fallback={<LoadingComp />}>
                    <VideoComponent
                        isChatOpen={chatOpen}
                        setChatOpen={setChatOpen}
                    />
                </Suspense>
            </div>
            {chatOpen ? (
                <div
                    aria-expanded={chatOpen}
                    className="h-2/3 md:w-2/5 md:h-full"
                >
                    <Suspense fallback={<LoadingComp />}>
                        <ChatComponent
                            toogleWindowOpen={() =>
                                setChatOpen((prev) => !prev)
                            }
                        />
                    </Suspense>
                </div>
            ) : null}
        </div>
    );
}
