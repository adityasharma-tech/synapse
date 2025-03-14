import axios, { CreateAxiosDefaults } from "axios";

const baseHost = import.meta.env.VITE_BACKEND_HOST; 

const axiosConfig: CreateAxiosDefaults = {
    baseURL: `${baseHost}/api/v1`,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
}

const axiosInstance = axios.create(axiosConfig);

axiosInstance.interceptors.response.use(response => Promise.resolve(response), async(error)=>{
    if(error.response && error.response.data.errType === "ACCESS_TOKEN_EXPIRED"){
        try {
            await axiosInstance.post('/auth/refresh-token')
            return axiosInstance(error.config) // retry the previous request
        } catch (refreshTokenErr) {
            console.error(`Error updating refresh token: ${error.message}`);
            return Promise.reject(refreshTokenErr);
        }
    }
    return Promise.reject(error);
})

export default axiosInstance;