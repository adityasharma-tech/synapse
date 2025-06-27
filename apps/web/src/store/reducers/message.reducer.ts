import msgpack from "msgpack-lite";
import {
    createEntityAdapter,
    createSlice,
    EntityId,
    PayloadAction,
} from "@reduxjs/toolkit";
import { chatMessageT } from "@pkgs/lib";

interface Message extends chatMessageT {
    id: EntityId;
    uv: number;
    dv: number;
}

export const messageAdapter = createEntityAdapter<Message>();

const messageSlice = createSlice({
    name: "messages",
    initialState: messageAdapter.getInitialState(),
    reducers: {
        insertMessage: (
            state,
            action: PayloadAction<{
                id: string;
                buffer: Buffer;
            }>
        ) => {
            const entity = {
                id: action.payload.id,
                ...msgpack.decode(action.payload.buffer),
            };
            messageAdapter.addOne(state, entity);
        },
        deleteMessage: messageAdapter.removeOne,
        setAllMessages: messageAdapter.setMany,
        upvoteMessage: (state, action: PayloadAction<string>) => {
            messageAdapter.updateOne(state, {
                id: action.payload,
                changes: {
                    uv: (state.entities[action.payload].uv += 1),
                },
            });
        },
        downvoteMessage: (state, action: PayloadAction<string>) => {
            messageAdapter.updateOne(state, {
                id: action.payload,
                changes: {
                    dv: (state.entities[action.payload].dv += 1),
                },
            });
        },
        remUpvoteMessage: (state, action: PayloadAction<string>) => {
            messageAdapter.updateOne(state, {
                id: action.payload,
                changes: {
                    uv: (state.entities[action.payload].uv -= 1),
                },
            });
        },
        remDownvoteMessage: (state, action: PayloadAction<string>) => {
            messageAdapter.updateOne(state, {
                id: action.payload,
                changes: {
                    dv: (state.entities[action.payload].dv -= 1),
                },
            });
        },
    },
});

export default messageSlice.reducer;

export const {
    deleteMessage,
    downvoteMessage,
    insertMessage,
    remDownvoteMessage,
    remUpvoteMessage,
    upvoteMessage,
} = messageSlice.actions;
