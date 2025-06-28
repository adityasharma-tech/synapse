import { environment as env } from "../../../environments/environment";
import axios, { CreateAxiosDefaults } from "axios";

const axiosConfig: CreateAxiosDefaults = {
    baseURL: `${env.backendUrl}/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
};

const apiClient = axios.create(axiosConfig);

apiClient.interceptors.response.use(
    (response) => Promise.resolve(response),
    async (error) => {
        if (
            error.response &&
            error.response.data.errType === "ACCESS_TOKEN_EXPIRED"
        ) {
            try {
                await apiClient.post("/auth/refresh-token");
                return apiClient(error.config);
            } catch (refreshTokenErr) {
                console.error(`Error updating refresh token: ${error.message}`);
                return Promise.reject(refreshTokenErr);
            }
        }
        return Promise.reject(error);
    }
);

export { apiClient };
