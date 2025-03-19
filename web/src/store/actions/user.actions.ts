import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUser, logoutUser } from "../../lib/apiClient";

const fetchUser = createAsyncThunk('user/fetchUser', async () => {
    const result = await getUser()
    if(!result.data.success) throw new Error("Failed to get user.");
    return result.data.data.user
})

const logout = createAsyncThunk('user/logout', async ()=> {
    const result = await logoutUser();
    if(!result.data.success) throw new Error('Failed to logout.');
})

export {
    fetchUser,
    logout
}