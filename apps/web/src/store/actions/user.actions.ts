import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUser, logoutUser } from "../../lib/apiClient";

// makes request to the backend for setting user state
const fetchUser = createAsyncThunk("user/fetchUser", async () => {
    const result = await getUser();
    if (!result.data.success) throw new Error("Failed to get user.");
    return result.data.data.user;
});

// logout user by removing user state and making request to backend to clear cookies
const logout = createAsyncThunk("user/logout", async () => {
    const result = await logoutUser();
    if (!result.data.success) throw new Error("Failed to logout.");
});

export { fetchUser, logout };
