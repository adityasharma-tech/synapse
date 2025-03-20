import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserT } from "../../lib/types";

interface StreamUserT extends UserT {
  fullName: string
}

export interface BasicChatT {
  id: number;
  message: string;
  markRead: boolean;
  votes: number;
  user: Partial<StreamUserT> | {[key: string]: any};
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PremiumChatT extends BasicChatT {
  message: string;
  pinned: boolean;
  amount: string;
  paymentStatus?: string;
}

interface RemoveBasicChatT {
  id: number;
}

interface UpVoteBasicChatT extends RemoveBasicChatT {}
interface DownVoteBasicChatT extends RemoveBasicChatT {}

interface UpdateBasicChatPayloadT {
  id: number;
  message: string;
}

// Define a type for the slice state
interface DashStreamReducer {
  streamRunning: boolean;
  streamId: string | null;
  basicChats: BasicChatT[];
  premiumChats: PremiumChatT[];
  stream: any;
}

// Define the initial state using that type
const initialState: DashStreamReducer = {
  streamRunning: false,
  streamId: null,
  basicChats: [],
  premiumChats: [],
  stream: {},
};

export const dashStreamSlice = createSlice({
  name: "dash-stream",
  initialState,
  reducers: {
    // update streamid
    updateStreamId: (state, action: PayloadAction<string>) => {
      if (state.streamId || state.streamRunning)
        return console.error(`You can't update stream id after setting.`);
      state.streamId = action.payload;
    },

    // start streaming
    startStreaming: (state)=>{
      state.streamRunning = true;
    },

    // stop streaming
    stopStreaming: (state) => {
      state.streamId = null;
      state.streamRunning = false;
    },

    // add basic chat
    addBasicChat: (state, action: PayloadAction<BasicChatT>) => {
      state.basicChats.push(action.payload);
    },

    // remove basic chat
    removeBasicChat: (state, action: PayloadAction<RemoveBasicChatT>) => {
      const deleteIndex = state.basicChats.findIndex(
        (value) => value.id == action.payload.id
      );
      if (deleteIndex <= -1)
        return console.error(`Cann't find message to be updated.`);

      state.basicChats.splice(deleteIndex, 1);
    },

    // add a premium (payment chat)
    addPremiumChat: (state, action: PayloadAction<PremiumChatT>) => {
      state.premiumChats.push(action.payload);
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

    // upvoting a basic chat
    upVoteBasicChat: (state, action: PayloadAction<UpVoteBasicChatT>) => {
      const updateIndex = state.basicChats.findIndex(
        (value) => value.id == action.payload.id
      );
      if (updateIndex <= -1)
        return console.error(`Cann't find message to be updated.`);

      state.basicChats[updateIndex].votes += 1;
    },

    // downvoting a basic chat
    downVoteBasicChat: (state, action: PayloadAction<DownVoteBasicChatT>) => {
      const updateIndex = state.basicChats.findIndex(
        (value) => value.id == action.payload.id
      );
      if (updateIndex <= -1)
        return console.error(`Cann't find message to be updated.`);

      state.basicChats[updateIndex].votes -= 1;
    },
  },
});

export const {
  updateStreamId,
  stopStreaming,
  addBasicChat,
  addPremiumChat,
  updateBasicChat,
  removeBasicChat,
  upVoteBasicChat,
  downVoteBasicChat,
  startStreaming
} = dashStreamSlice.actions;

export default dashStreamSlice.reducer;
