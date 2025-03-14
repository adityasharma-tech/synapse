import { createSlice } from '@reduxjs/toolkit'
import { UserT } from '../../lib/types'
import { fetchUser, logoutUser } from '../actions/user.actions';

// Define a type for the slice state
export interface AppState {
    user: UserT | null;
    appLoading: boolean;
    loadingStatus: 'fulfilled' | 'pending' | 'rejected' | 'idle';
}

// Define the initial state using that type
const initialState: AppState = {
    user: null,
    appLoading: true,
    loadingStatus: 'idle'
}

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUser.pending, (state)=>{
            state.appLoading = true;
        })
        builder.addCase(fetchUser.fulfilled, (state, action)=>{
            state.user = action.payload;
            state.appLoading = false;
        })
        builder.addCase(fetchUser.rejected, (state)=>{
            state.user = null;
            state.appLoading = false;
        })
        builder.addCase(logoutUser.fulfilled, (state)=>{
            state.user = null;
            state.loadingStatus = 'fulfilled';
        })
        builder.addCase(logoutUser.pending, (state)=>{
            state.loadingStatus = 'pending';
        })
        builder.addCase(logoutUser.rejected, (state)=>{
            state.loadingStatus = 'rejected';
        })
    }
})

export const {  } = appSlice.actions

export default appSlice.reducer