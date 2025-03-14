import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios";

const fetchUser = createAsyncThunk('user/fetchUser', async () => {
    const result = await axiosInstance.get('/user')
    if(!result.data.success) throw new Error("Failed to get user.");
    return result.data.data.user
})

const logoutUser = createAsyncThunk('user/logout', async ()=> {
    const result = await axiosInstance.get('/user/logout')
    if(!result.data.success) throw new Error('Failed to logout.');
})

export {
    fetchUser,
    logoutUser
}