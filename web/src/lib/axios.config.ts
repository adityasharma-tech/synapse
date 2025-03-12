import axios, { CreateAxiosDefaults } from "axios";

const axiosConfig: CreateAxiosDefaults = {
    baseURL: import.meta.env.BACKEND_HOST,
    withCredentials: false
}

const axiosInstance = axios.create(axiosConfig); 

export default axiosInstance;