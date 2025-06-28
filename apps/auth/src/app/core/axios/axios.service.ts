import { Injectable } from "@angular/core";
import { apiClient } from "./axios-client";
import { AxiosResponse } from "axios";

@Injectable({
    providedIn: "root",
})
declare class ApiResponse {
    statusCode: number;
    data: any;
    message: string;
    success: boolean;
    constructor(statusCode: number, data: any, message: string);
}

declare class ApiError {
    statusCode: number;
    data: null;
    message: string;
    success: boolean;
    errType: string;
    errors: any[];
    constructor(statusCode: number, message: string, errType: string);
}

export class AxiosService {
    async handleRequest(axiosReq: Promise<AxiosResponse<ApiResponse, any>>) {
        try {
            const request = await axiosReq;
            const result = request.data;

            return { result, success: true };
        } catch (error: any) {
            if (error.response) {
                console.error(error.response);
                return {
                    error: error.response.data as ApiError,
                    success: false,
                };
            } else {
                return { error, success: false };
            }
        }
    }

    loginUser(payload: {
        emailOrUsername: string;
        password: string;
    }): Promise<AxiosResponse<ApiResponse, any>> {
        return apiClient.post("/auth/login", {
            username: payload.emailOrUsername.includes("@")
                ? undefined
                : payload.emailOrUsername,
            email: payload.emailOrUsername.includes("@")
                ? payload.emailOrUsername
                : undefined,
            password: payload.password,
        });
    }

    registerUser(payload: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        password: string;
    }): Promise<AxiosResponse<ApiResponse, any>> {
        return apiClient.post("/auth/login", payload);
    }

    logoutUser() {
        return apiClient.get("/user/logout");
    }

    constructor() {}
}
