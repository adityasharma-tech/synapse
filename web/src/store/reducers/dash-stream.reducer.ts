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
  amount: string;
  paymentStatus?: string;
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
  userId: string;
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
}

// Define the initial state using that type
const initialState: DashStreamReducer = {
  streamRunning: false,
  streamId: null,
  basicChats: [],
  premiumChats: [],
  stream: {},
  typerNames: [],
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
    startStreaming: (state) => {
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

      state.basicChats[updateIndex].upVotes++;
    },

    // downvoting a basic chat
    downVoteBasicChat: (state, action: PayloadAction<DownVoteBasicChatT>) => {
      const updateIndex = state.basicChats.findIndex(
        (value) => value.id == action.payload.id
      );
      if (updateIndex <= -1)
        return console.error(`Cann't find message to be updated.`);

      state.basicChats[updateIndex].downVotes++;
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
        if (updateBChat >= 0) state.premiumChats[updatePChat].markRead = true;
      } else {
        state.basicChats[updateBChat].markRead = true;
      }
    },

    // if someone is typeing add their payload data
    registerTypingEvent: (state, action: PayloadAction<TypingEventPayloadT>) => {
      const typerIndex = state.typerNames.findIndex(
        (value) => value.userId == action.payload.userId
      );
      if (typerIndex <= -1) state.typerNames.push(action.payload);
    },

    // remove their typing event from typers data
    removeTypingEvent: (state, action: PayloadAction<TypingEventPayloadT>) => {
      const typerIndex = state.typerNames.findIndex(
        (value) => value.userId == action.payload.userId
      );
      if (typerIndex >= 0) state.typerNames.splice(typerIndex, 1);
    },
  },
  // extra reducers for async thunks
  extraReducers: (builder) => {
    builder.addCase(setAllPreChats.fulfilled, (state, action) => {
      state.basicChats = action.payload;
    });
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
  startStreaming,
  registerTypingEvent,
  removeTypingEvent
} = dashStreamSlice.actions;

export default dashStreamSlice.reducer;
