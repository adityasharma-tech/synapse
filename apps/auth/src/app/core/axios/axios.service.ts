import { Injectable } from "@angular/core";
import { apiClient } from "./axios-client";
import { AxiosResponse } from "axios";
import { injectDispatch } from "@reduxjs/angular-redux";
import { AppDispatch } from "../store/store";
import { setLoading, setUser } from "../store/features/app.slice";

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

@Injectable({
    providedIn: "root",
})
export class AxiosService {
    dispatch = injectDispatch<AppDispatch>();

    setUser = setUser;

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
            } else return { error, success: false };
        }
    }

    loginUser(payload: {
        emailOrUsername: string;
        password: string;
    }): Promise<AxiosResponse<ApiResponse, any>> {
        return apiClient.post("/auth/login", {
            username: payload.emailOrUsername.includes("@")
                ? ""
                : payload.emailOrUsername,
            email: payload.emailOrUsername.includes("@")
                ? payload.emailOrUsername
                : "",
            password: payload.password,
            metadata: {
                languages: navigator.languages,
            },
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

    logoutUser(): Promise<AxiosResponse<ApiResponse, any>> {
        return apiClient.get("/user/logout");
    }

    fetchUser(): Promise<AxiosResponse<ApiResponse, any>> {
        return apiClient.get("/user");
    }

    async checkUser() {
        this.dispatch(setLoading(false));
        this.dispatch(setLoading(true));
        const { result, error } = await this.handleRequest(this.fetchUser());
        if (result) this.dispatch(this.setUser(result.data.user));

        if (error) console.error("axiosService.checkUser: ", error);

        this.dispatch(setLoading(false));
    }

    constructor() {}
}
