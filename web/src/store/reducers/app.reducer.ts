import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { UserT } from '../../lib/types'
import axiosInstance from '../../lib/axios';

// Define a type for the slice state
export interface AppState {
    user: UserT | null;
    appLoading: boolean;
}

export const fetchUser = createAsyncThunk('user/fetchUser', async () => {
    const result = await axiosInstance.get('/user')
    if(!result.data.success) throw new Error("Failed to get user.");
    return result.data.data.user
})

// Define the initial state using that type
const initialState: AppState = {
    user: null,
    appLoading: true
}

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUser.pending, (state)=>{
            state.appLoading = true
        })
        builder.addCase(fetchUser.fulfilled, (state, action)=>{
            state.user = action.payload;
            state.appLoading = false;
        })
    }
})

export const {  } = appSlice.actions

export default appSlice.reducer