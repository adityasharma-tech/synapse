import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllChatByStreamId } from "../../lib/apiClient";

// this async thunk to fetch all the data from the server and set to chats for any stream
const setAllPreChats = createAsyncThunk('streams/setAllPreChats', async (payload: any) => {
    const result = await getAllChatByStreamId(payload)
    if(!result.data.success) throw new Error("Failed to get chats.");
    return result.data.data.chats
})

export {
    setAllPreChats
}