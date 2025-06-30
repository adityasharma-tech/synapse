import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SafeUserType } from "@pkgs/drizzle-client";

type AppInitialState = {
    user?: SafeUserType;
    fetchLoading: boolean;
};

const initialState: AppInitialState = {
    fetchLoading: true,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<SafeUserType>) => {
            state.user = action.payload;
            state.fetchLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.fetchLoading = action.payload;
        },
        clearUser: (state) => {
            state.user = undefined;
        },
    },
});

export const { setUser, setLoading, clearUser } = appSlice.actions;

export default appSlice.reducer;
