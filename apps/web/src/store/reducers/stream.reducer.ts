import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserT } from "../../lib/types";
import { setAllPreChats } from "../actions/stream.actions";

interface StreamUserT extends UserT {
    fullName: string;
}

export interface BasicChatT {
    id: string;
    message: string;
    markRead: boolean;
    upVotes: number;
    downVotes: number;
    user: Partial<StreamUserT> | { [key: string]: any };
    pinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PremiumChatT extends BasicChatT {
    orderId?: string;
    paymentAmount?: number;
    paymentCurrency?: string;
}

interface RemoveBasicChatT {
    id: string;
}

interface UpVoteBasicChatT extends RemoveBasicChatT {}
interface DownVoteBasicChatT extends RemoveBasicChatT {}
interface MarkReadDoneChatT extends RemoveBasicChatT {}

interface UpdateBasicChatPayloadT {
    id: string;
    message: string;
}

interface TypingEventPayloadT {
    userId: number;
    fullName: string;
}

// Define a type for the slice state
interface DashStreamReducer {
    streamRunning: boolean;
    streamId: string | null;
    basicChats: BasicChatT[];
    premiumChats: PremiumChatT[];
    stream: any;
    typerNames: TypingEventPayloadT[];
    userRole: "streamer" | "viewer" | "admin";
    totalQuestions: number;
}

// Define the initial state using that type
const initialState: DashStreamReducer = {
    streamRunning: false,
    streamId: null,
    basicChats: [],
    premiumChats: [],
    stream: {},
    typerNames: [],
    userRole: "viewer",
    totalQuestions: 0,
};

export const streamSlice = createSlice({
    name: "stream",
    initialState,
    reducers: {
        // update streamid
        updateStreamId: (state, action: PayloadAction<string>) => {
            if (state.streamId || state.streamRunning)
                return console.error(
                    `You can't update stream id after setting.`
                );
            state.streamId = action.payload;
        },

        // update role
        updateUserRole: (
            state,
            action: PayloadAction<"viewer" | "streamer" | "admin">
        ) => {
            state.userRole = action.payload;
        },

        // add basic chat
        addBasicChat: (state, action: PayloadAction<BasicChatT>) => {
            state.basicChats.push(action.payload);
            state.totalQuestions++;
        },

        // remove basic chat
        removeBasicChat: (state, action: PayloadAction<RemoveBasicChatT>) => {
            const deleteIndex = state.basicChats.findIndex(
                (value) => value.id == action.payload.id
            );
            if (deleteIndex <= -1)
                return console.error(`Cann't find message to be updated.`);

            state.basicChats.splice(deleteIndex, 1);
            state.totalQuestions--;
        },

        // add a premium (payment chat)
        addPremiumChat: (state, action: PayloadAction<PremiumChatT>) => {
            state.premiumChats.push(action.payload);
            state.totalQuestions++;
        },

        // message update of basic chat
        updateBasicChat: (
            state,
            action: PayloadAction<UpdateBasicChatPayloadT>
        ) => {
            const updateIndex = state.basicChats.findIndex(
                (value) => value.id == action.payload.id
            );
            if (updateIndex <= -1)
                return console.error(`Cann't find message to be updated.`);

            state.basicChats[updateIndex] = {
                ...state.basicChats[updateIndex],
                message: action.payload.message,
                updatedAt: new Date(),
            };
        },

        // increasing the upvoting of a basic chat
        upVoteBasicChat: (state, action: PayloadAction<UpVoteBasicChatT>) => {
            const updateIndex = state.basicChats.findIndex(
                (value) => value.id == action.payload.id
            );
            if (updateIndex <= -1)
                return console.error(`Cann't find message to be updated.`);

            state.basicChats[updateIndex].upVotes++;
            state.basicChats = state.basicChats.sort(
                (pre, post) =>
                    post.upVotes -
                    post.downVotes -
                    (pre.upVotes - pre.downVotes)
            );
        },

        // removing the upvotings of the basic chat
        upVoteDownBasicChat: (
            state,
            action: PayloadAction<UpVoteBasicChatT>
        ) => {
            const updateIndex = state.basicChats.findIndex(
                (value) => value.id == action.payload.id
            );
            if (updateIndex <= -1)
                return console.error(`Cann't find message to be updated.`);

            state.basicChats[updateIndex].upVotes--;
            state.basicChats = state.basicChats.sort(
                (pre, post) =>
                    post.upVotes -
                    post.downVotes -
                    (pre.upVotes - pre.downVotes)
            );
        },

        // downvoting a basic chat
        downVoteBasicChat: (
            state,
            action: PayloadAction<DownVoteBasicChatT>
        ) => {
            const updateIndex = state.basicChats.findIndex(
                (value) => value.id == action.payload.id
            );
            if (updateIndex <= -1)
                return console.error(`Cann't find message to be updated.`);

            state.basicChats[updateIndex].downVotes++;
            state.basicChats = state.basicChats.sort(
                (pre, post) =>
                    post.upVotes -
                    post.downVotes -
                    (pre.upVotes - pre.downVotes)
            );
        },

        // removing the down voted basic chat
        downVoteDownBasicChat: (
            state,
            action: PayloadAction<DownVoteBasicChatT>
        ) => {
            const updateIndex = state.basicChats.findIndex(
                (value) => value.id == action.payload.id
            );
            if (updateIndex <= -1)
                return console.error(`Cann't find message to be updated.`);

            state.basicChats[updateIndex].downVotes--;
            state.basicChats = state.basicChats.sort(
                (pre, post) =>
                    post.upVotes -
                    post.downVotes -
                    (pre.upVotes - pre.downVotes)
            );
        },

        // mark read done
        markDoneChat: (state, action: PayloadAction<MarkReadDoneChatT>) => {
            let updateBChat = state.basicChats.findIndex(
                (value) => value.id == action.payload.id
            );
            if (updateBChat <= -1) {
                const updatePChat = state.premiumChats.findIndex(
                    (value) => value.id == action.payload.id
                );
                if (updateBChat >= 0)
                    state.premiumChats[updatePChat].markRead = true;
            } else {
                state.basicChats[updateBChat].markRead = true;
            }
        },

        // if someone is typeing add their payload data
        registerTypingEvent: (
            state,
            action: PayloadAction<TypingEventPayloadT>
        ) => {
            const typerIndex = state.typerNames.findIndex(
                (value) => value.userId == action.payload.userId
            );
            if (typerIndex <= -1) state.typerNames.push(action.payload);
        },

        // remove their typing event from typers data
        removeTypingEvent: (
            state,
            action: PayloadAction<TypingEventPayloadT>
        ) => {
            const typerIndex = state.typerNames.findIndex(
                (value) => value.userId == action.payload.userId
            );
            if (typerIndex >= 0) state.typerNames.splice(typerIndex, 1);
        },
    },

    // extra reducers for async thunks
    extraReducers: (builder) => {
        builder.addCase(setAllPreChats.fulfilled, (state, action) => {
            if (action.payload.length <= 0) return;

            state.totalQuestions = action.payload.length;

            state.premiumChats = [];
            state.basicChats = [];

            action.payload.forEach((chat: any) => {
                chat.orderId
                    ? state.premiumChats.push(chat)
                    : state.basicChats.push(chat);
            });
        });
    },
});

export const {
    updateStreamId,
    addBasicChat,
    addPremiumChat,
    updateBasicChat,
    removeBasicChat,
    upVoteBasicChat,
    downVoteBasicChat,
    registerTypingEvent,
    removeTypingEvent,
    markDoneChat,
    upVoteDownBasicChat,
    downVoteDownBasicChat,
    updateUserRole,
} = streamSlice.actions;

export default streamSlice.reducer;
