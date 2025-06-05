import { useAppSelector } from "@/store";
import { Link } from "react-router";

export default function VideoWindowComponent() {
    const streamState = useAppSelector((state) => state.stream);

    return (
        <section className="h-full flex flex-col gap-y-3">
            <div className="bg-neutral-900 rounded-md flex items-center h-9">
                <Link to="/">
                    <img
                        alt="Synapse"
                        src="/T&W@2x.png"
                        className="object-contain h-7"
                    />
                </Link>
            </div>
            {streamState.videoUrl ? (
                <iframe
                    src={`https://www.youtube.com/embed/${new URL(
                        streamState.videoUrl
                    ).searchParams.get("v")}?&amp;autoplay=1&amp;mute=0`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="rounded-lg overflow-hidden w-full min-h-2/3 border border-neutral-900"
                ></iframe>
            ) : null}
            <div className="bg-neutral-900 rounded-md py-4 px-3 flex justify-between">
                <div className="flex items-center gap-x-2">
                    <img
                        className="size-10 rounded-full"
                        src={`https://avatar.iran.liara.run/public?id=${streamState.metadata.channelName}`}
                    />
                    <div>
                        <div className="font-medium mb-1">
                            {streamState.metadata.channelName}
                        </div>
                        <div className="text-xs text-neutral-300">
                            {streamState.metadata.title}
                        </div>
                    </div>
                    <div>
                        <button className="uppercase font-medium bg-rose-700 px-1.5 py-0.5 rounded mx-3 md:cursor-pointer active:ring-3 text-sm ring-rose-800/30">
                            subscribe
                        </button>
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="flex gap-x-1 px-2">
                        <svg className="size-5" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M5 21a7 7 0 1114 0M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                                className="stroke-2 stroke-rose-600"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="text-rose-600">
                            {streamState.currentViewers}
                        </span>
                    </div>
                    <div className="px-3">
                        <button className="hover:bg-neutral-950 p-1.5 bg-neutral-950/80 rounded md:cursor-pointer">
                            <svg
                                className="size-4.5 stroke-neutral-50 stroke-1"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M20 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m12-5l-4-4m0 0L8 8m4-4v12"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
