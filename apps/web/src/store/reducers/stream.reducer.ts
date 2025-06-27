import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Role as UserRole } from "@pkgs/lib";
import { SubsciptionStatusT } from "@pkgs/drizzle-client";

interface StreamState {
    streamId: string;
    activeTypers: string[];
    streamRole: UserRole;
    videoSource: string;
    viewerCount: number;
    streamTitle: string;

    channel: ChannelInfo;
    subscription: SubscriptionInfo | null;
    emotes: CustomEmote[];
}

interface ChannelInfo {
    channelName: string;
    avatarUrl: string;
    streamerId: number;
    channelBio?: string;
}

interface SubscriptionInfo {
    status: SubsciptionStatusT;
    streamerId: number;
    subscriptionId: number;
}

interface CustomEmote {
    code: string;
    name: string;
    imageUrl: string;
}

const initialState: StreamState = {
    streamId: "",
    activeTypers: [],
    streamRole: "viewer",
    videoSource: "",
    viewerCount: 0,
    streamTitle: "",

    channel: {
        channelName: "",
        avatarUrl: "",
        streamerId: 0,
        channelBio: "",
    },
    subscription: null,
    emotes: [],
};

const streamSlice = createSlice({
    name: "stream",
    initialState,
    reducers: {
        setStreamDetails: (
            state,
            action: PayloadAction<{
                streamId: string;
                streamRole: UserRole;
                videoSource: string;
                streamTitle: string;
                channel: ChannelInfo;
            }>
        ) => {
            const { streamId, streamRole, videoSource, streamTitle, channel } =
                action.payload;
            state.streamId = streamId;
            state.streamRole = streamRole;
            state.videoSource = videoSource;
            state.streamTitle = streamTitle;
            state.channel = channel;
        },
        setViewerCount: (state, action: PayloadAction<number>) => {
            state.viewerCount = action.payload;
        },
        setSubscription: (state, action: PayloadAction<SubscriptionInfo>) => {
            state.subscription = action.payload;
        },
        setCustomEmotes: (state, action: PayloadAction<CustomEmote[]>) => {
            state.emotes = action.payload;
        },
        addActiveTyper: (state, action: PayloadAction<string>) => {
            if (!state.activeTypers.includes(action.payload))
                state.activeTypers.push(action.payload);
        },
    },
});

export const {
    addActiveTyper,
    setCustomEmotes,
    setStreamDetails,
    setSubscription,
    setViewerCount,
} = streamSlice.actions;

export default streamSlice.reducer;
