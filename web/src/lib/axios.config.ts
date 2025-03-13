import axios, { CreateAxiosDefaults } from "axios";

const baseHost = import.meta.env.VITE_BACKEND_HOST; 

const axiosConfig: CreateAxiosDefaults = {
    baseURL: `${baseHost}/api/v1`,
    withCredentials: false
}

const axiosInstance = axios.create(axiosConfig); 

export default axiosInstance;