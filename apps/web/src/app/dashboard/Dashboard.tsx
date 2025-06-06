import React, {
    ChangeEvent,
    MouseEventHandler,
    useCallback,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useDebounce } from "../../lib/utils";
import { requestHandler } from "../../lib/requestHandler";
import {
    getAllStreams,
    getYoutubeVideoData,
    startNewStream,
} from "../../lib/apiClient";

export default function DashboardPage() {
    const navigate = useNavigate();

    const user = useAppSelector((state) => state.app.user);
    const videoInputRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [streamFetchLoading, setStreamFetchLoading] = useState(false);
    const [previousStreams, setPreviousStreams] = useState<any[]>([]);

    const [videoData, setVideoData] = useState<{
        title: string;
        thumbnail: string;
        channelTitle: string;
    } | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);

    const handleCreateStream: MouseEventHandler<HTMLButtonElement> =
        useCallback(
            async (e) => {
                e.preventDefault();
                // if (videoInputRef.current)
                // await requestHandler(
                //     startNewStream({
                //         title: videoInputRef.current.value
                //             .trim()
                //             .startsWith("https://")
                //             ? (videoData?.title ?? "")
                //             : videoInputRef.current.value.trim(),
                //         youtubeVideoUrl: videoInputRef.current.value
                //             .trim()
                //             .startsWith("https://")
                //             ? videoInputRef.current.value.trim()
                //             : "",
                //     }),
                //     setLoading,
                //     (res) => {
                //         navigate(`/stream/${res.data.stream.streamingUid}`);
                //     }
                // );
            },
            [
                videoInputRef,
                requestHandler,
                startNewStream,
                setLoading,
                navigate,
                videoData,
            ]
        );

    const handleFetchStreams = useCallback(async () => {
        await requestHandler(
            getAllStreams(),
            setStreamFetchLoading,
            (result) => {
                setPreviousStreams(result.data.data);
            },
            undefined
        );
    }, [requestHandler, getAllStreams, setPreviousStreams]);

    React.useEffect(() => {
        if (user?.role == "viewer") return;
        handleFetchStreams();
    }, [user]);

    const debouncer = useDebounce();

    const handleFetchVideoData = useCallback(
        async function (e: ChangeEvent<HTMLInputElement>) {
            if (e.target.value.trim() == "") return;
            if (!e.target.value.trim().startsWith("https://")) return;
            await requestHandler(
                getYoutubeVideoData(e.target.value),
                undefined,
                (data) => {
                    setVideoData(data.data);
                }
            );
        },
        [requestHandler, getYoutubeVideoData, setVideoData]
    );

    React.useEffect(() => {
        console.log(videoData);
    }, [videoData]);

    return (
        <React.Fragment>
            <header className="px-5 flex justify-between py-4">
                <img
                    alt="Synapse"
                    src="/T&W@2x.png"
                    className="object-contain h-10"
                />
                <div className="flex items-center gap-x-3">
                    {user?.role == "admin" || user?.role == "streamer" ? (
                        <button
                            onClick={() => setDialogOpen(!dialogOpen)}
                            className="dark:bg-neutral-200 px-4 cursor-pointer hover:bg-neutral-100 transition-colors active:bg-neutral-300 dark:text-neutral-800 py-2 rounded-lg"
                        >
                            Start new stream
                        </button>
                    ) : null}
                    <hr className="h-full border border-neutral-700" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex gap-x-3 bg-neutral-800 cursor-pointer items-center rounded-lg p-2 pr-10">
                                <div>
                                    <img
                                        className="size-8"
                                        src="https://avatar.iran.liara.run/username?username=AdityaSharma"
                                    />
                                </div>
                                <div className="flex flex-col items-start justify-start">
                                    <span className="text-sm">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {user?.role}
                                    </span>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-neutral-100">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuGroup>
                                {user?.role == "viewer" ? (
                                    <DropdownMenuItem
                                        onClick={() => navigate("apply")}
                                    >
                                        Apply for streamer
                                    </DropdownMenuItem>
                                ) : user?.role == "admin" ? (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            navigate("streamer-applications")
                                        }
                                    >
                                        View all applications
                                    </DropdownMenuItem>
                                ) : null}
                            </DropdownMenuGroup>
                            <DropdownMenuItem disabled>API</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => navigate("/user/logout")}
                            >
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            {/* Dialog */}
            <span
                data-open={dialogOpen}
                onClick={() => setDialogOpen(false)}
                className="z-10 bg-neutral-500/10 transition-all data-[open=false]:hidden inset-0 fixed backdrop-blur-xs"
            />
            <div
                data-open={dialogOpen}
                className="top-1/2 left-1/2 data-[open=false]:hidden -translate-1/2 -translate-y-1/2 px-10 rounded-xl py-10 fixed z-30"
            >
                <div className="flex justify-end">
                    <button
                        onClick={() => setDialogOpen(!dialogOpen)}
                        className="p-2 bg-neutral-900 hover:bg-neutral-800 cursor-pointer rounded-lg mb-2"
                    >
                        <svg
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M6.995 7.006a1 1 0 000 1.415l3.585 3.585-3.585 3.585a1 1 0 101.414 1.414l3.585-3.585 3.585 3.585a1 1 0 001.415-1.414l-3.586-3.585 3.586-3.585a1 1 0 00-1.415-1.415l-3.585 3.585L8.41 7.006a1 1 0 00-1.414 0z"
                                fill="#fff"
                            />
                        </svg>
                    </button>
                </div>
                <div className="min-w-sm min-h-12 bg-neutral-900 rounded-lg p-3">
                    <div className="flex gap-x-2 p-2 bg-[#222] rounded-md">
                        <div>
                            <img
                                className="h-36 rounded-md"
                                src={videoData?.thumbnail}
                                alt="Thumbnail"
                            />
                        </div>
                        <div>
                            <div className="text-lg">{videoData?.title}</div>
                            <div className="text-sm mt-2 text-neutral-400">
                                {videoData?.channelTitle}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-2 rounded-lg py-1 bg-[#222] my-3">
                        <div className="flex items-center gap-x-2 px-3">
                            <div>
                                <img
                                    src="https://youtube.com/favicon.ico"
                                    className=""
                                />
                            </div>
                            <span>YouTube Link</span>
                        </div>
                        <div className="flex-grow mr-1 rounded-md bg-neutral-900 px-2 focus-within:border-neutral-600 border border-transparent">
                            <input
                                ref={videoInputRef}
                                onChange={(e) =>
                                    debouncer(
                                        handleFetchVideoData.bind(null, e),
                                        1000
                                    )
                                }
                                className="h-8 focus:outline-none w-full"
                                placeholder="https://www.youtube.com/watch/?v="
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-10">
                        <button
                            onClick={handleCreateStream}
                            disabled={loading}
                            className="bg-black disabled:opacity-85 py-2 px-3 flex rounded-lg hover:bg-neutral-950 cursor-pointer active:bg-neutral-800"
                        >
                            Start new stream
                            <span
                                data-loading={loading}
                                className="loading data-[loading=true]:block hidden loading-spinner loading-xs"
                            ></span>
                        </button>
                    </div>
                </div>
            </div>
            <section className="h-[calc(100vh-72px)] flex gap-x-4 px-5 pb-5">
                <div className="h-full w-[60%] bg-[#222] rounded-xl p-3 relative">
                    <div className="font-medium text-neutral-100 text-lg">
                        Analytics
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-1/2 -translate-y-1/2">
                        No analytics yet!
                    </div>
                </div>
                <div className="h-full w-[40%] flex flex-col gap-5">
                    <div className="h-[60%] w-full bg-[#222] rounded-xl p-3 overflow-y-auto">
                        <div className="font-medium text-neutral-100 text-lg">
                            Your streams
                        </div>
                        <span
                            data-loading={streamFetchLoading}
                            className="loading data-[loading=true]:block hidden loading-spinner loading-xs"
                        ></span>
                        {previousStreams.map((str, idx) => (
                            <div
                                role="button"
                                tabIndex={0}
                                key={idx}
                                className="bg-neutral-900 first:mt-0 mt-3 rounded-lg shadow p-2 flex justify-between"
                            >
                                <div className="flex gap-x-3">
                                    <div>
                                        <img
                                            className="h-16 rounded-md"
                                            src={
                                                str.thumbnailUrl ??
                                                "https://placehold.co/150x80"
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center gap-y-1">
                                        <div className="font-medium">
                                            {str.streamTitle}
                                        </div>
                                        {str.videoUrl ? (
                                            <div className="text-xs text-neutral-400">
                                                {str.videoUrl}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center px-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            window.navigator.clipboard.writeText(
                                                `https://${window.location.host}/stream/${str.streamingUid}`
                                            )
                                        }
                                        className="px-2 cursor-pointer bg-neutral-900 active:bg-neutral-800 transition-colors rounded-md py-2"
                                    >
                                        <svg
                                            width="1.5em"
                                            height="1.5em"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M21 8a3 3 0 00-3-3h-8a3 3 0 00-3 3v12a3 3 0 003 3h8a3 3 0 003-3V8zm-2 0a1 1 0 00-1-1h-8a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V8z"
                                                fill="#fff"
                                            />
                                            <path
                                                d="M6 3h10a1 1 0 100-2H6a3 3 0 00-3 3v14a1 1 0 102 0V4a1 1 0 011-1z"
                                                fill="#fff"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="h-full w-full bg-[#222] rounded-xl p-3">
                        <div className="text-neutral-100 text-lg">
                            Previous Chats
                        </div>
                    </div>
                </div>
            </section>
        </React.Fragment>
    );
}
