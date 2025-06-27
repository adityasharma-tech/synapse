import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";
import { UserRole } from "@pkgs/drizzle-client";
import { AxiosError, AxiosRequestConfig } from "axios";
import { apiClient } from "@/lib/apiClient";

declare class ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
    constructor(statusCode: number, data: T, message?: string);
}

const axiosBaseQuery =
    (): BaseQueryFn<
        {
            url: string;
            method?: AxiosRequestConfig["method"];
            data?: AxiosRequestConfig["data"];
            params?: AxiosRequestConfig["params"];
        },
        unknown,
        unknown
    > =>
    async ({ url, method, data, params }) => {
        try {
            const result = await apiClient({
                url,
                method,
                data,
                params,
            });
            return { data: result.data };
        } catch (axiosError) {
            const err = axiosError as AxiosError;
            return {
                error: {
                    status: err.response?.status,
                    data: err.response?.data || err.message,
                },
            };
        }
    };

export const streamApi = createApi({
    reducerPath: "streamApi",
    baseQuery: axiosBaseQuery(),
    endpoints(builder) {
        return {
            initiatePremiumChat: builder.mutation<
                ApiResponse<{ paymentSessionId: string; orderId: string }>,
                { streamId: string; message: string; amount: number }
            >({
                query: ({ streamId, message, amount }) => ({
                    url: `/streams/${streamId}/premium-chat`,
                    method: "post",
                    data: {
                        paymentAmount: amount,
                        message,
                    },
                }),
            }),
            fetchStream: builder.mutation<
                ApiResponse<{
                    stream: {
                        streamTitle: string;
                        streamUid: string;
                        streamerId: number;
                        id: number;
                        videoUrl: string;
                        about: string | null;
                        streamerName: string;
                    };
                    userRole: UserRole;
                }>,
                { streamId: string }
            >({
                query: ({ streamId }) => ({
                    url: `/streams/${streamId}`,
                    method: "get",
                }),
            }),
            fetchEmotes: builder.mutation<
                ApiResponse<
                    {
                        code: string;
                        name: string;
                        imageUrl: string;
                    }[]
                >,
                { streamerId: number }
            >({
                query: ({ streamerId }) => ({
                    url: `/user/emotes/${streamerId}`,
                    method: "get",
                }),
            }),
        };
    },
});

export const {
    useFetchEmotesMutation,
    useFetchStreamMutation,
    useInitiatePremiumChatMutation,
} = streamApi;
