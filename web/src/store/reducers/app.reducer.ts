import { createSlice } from '@reduxjs/toolkit'
import { UserT } from '../../lib/types'
import axiosInstance from '../../lib/axios';

// Define a type for the slice state
export interface AppState {
    user: UserT | null;
    loading: boolean;
}

// Define the initial state using that type
const initialState: AppState = {
    user: null,
    loading: false
}

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        fetchUser: (state) => {
            state.loading = true
            axiosInstance.get('/user')
                .then((result) => {
                    if (result.data) {
                        state.user = result.data.data.user;
                    }
                }).finally(() => { state.loading = false })

        }
    }
})

export const { fetchUser } = appSlice.actions

export default appSlice.reducer