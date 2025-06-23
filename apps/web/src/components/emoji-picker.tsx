import React from "react";

interface EmojiT {
    id: string;
    name: string;
    shortcodes: string;
    imageUrl: string;
}

interface EmojiPickerProps {
    data: {
        streamerId: string;
        streamerName: string;
        emojis: EmojiT[];
    }[];
    onEmojiSelect(emoji: EmojiT): void;
}

export default function EmojiPicker({
    data,
    onEmojiSelect,
}: React.PropsWithChildren<EmojiPickerProps>) {
    return (
        <React.Fragment>
            <div className="min-w-64 min-h-64 rounded relative z-20 text-sm overflow-y-auto">
                <div className="p-1">
                    {data.map((streamer) => (
                        <div key={streamer.streamerId}>
                            <div className="flex gap-x-2 items-center py-2 px-2 bg-neutral-900">
                                <img
                                    alt={streamer.streamerName}
                                    src={`https://placehold.co/400?id=${streamer.streamerId}`}
                                    className="size-4"
                                />
                                <span className="text-xs">
                                    {streamer.streamerName}
                                </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 p-2">
                                {streamer.emojis.map((emoji) => (
                                    <button
                                        onClick={() => onEmojiSelect(emoji)}
                                        key={emoji.id}
                                    >
                                        <img
                                            alt={emoji.id}
                                            src={emoji.imageUrl}
                                            className="size-7"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </React.Fragment>
    );
}
