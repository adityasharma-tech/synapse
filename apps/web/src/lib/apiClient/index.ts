import axios, { CreateAxiosDefaults } from "axios";
import {
    GetAllStreamsPayloadT,
    GetStreamByIdPayloadT,
    GetStreamerSubscriptionDetailPayloadT,
    LoginUserPayloadT,
    MakePremiumChatOrderPayloadT,
    ResendEmailVerificationPayloadT,
    SignupUserPayloadT,
    SSOGoogleAuthPayloadT,
    VerifyEmailPayloadT,
} from "./intefaces";

import {
    CreateStreamPayloadT,
    CreatePlanPayloadT,
    GetChannelPlanDetailPayloadT,
    CreateSubscriptionPayloadT,
} from "@pkgs/zod-client/validators";
import { env } from "../../lib/utils";

// backend host
const baseHost = env.VITE_BACKEND_HOST;

// axios configuration specifically for our backend
const axiosConfig: CreateAxiosDefaults = {
    baseURL: `${baseHost}/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // adding this will also send/recieve secure cookies from server
};

// ...
const apiClient = axios.create(axiosConfig);

// interceptors in axios is like middleware
// here I am using response middlware which will run after making a request but
// before returning the reponse data
apiClient.interceptors.response.use(
    (response) => Promise.resolve(response),
    async (error) => {
        if (
            error.response &&
            error.response.data.errType === "ACCESS_TOKEN_EXPIRED"
        ) {
            try {
                await apiClient.post("/auth/refresh-token");
                return apiClient(error.config); // retry the previous request
            } catch (refreshTokenErr) {
                console.error(`Error updating refresh token: ${error.message}`);
                return Promise.reject(refreshTokenErr);
            }
        }
        return Promise.reject(error);
    }
);

// get user info
function getUser() {
    return apiClient.get("/user");
}

// logout user
function logoutUser() {
    return apiClient.get("/user/logout");
}

/**
 * @description makes an api request with email & password as payload and
 * login user by setting accessToken & refreshToken
 * @param {LoginUserPayloadT} payload - take email/password as payload
 * @returns {Promise} - promise with some data
 */
function loginUser(payload: LoginUserPayloadT) {
    return apiClient.post("/auth/login", payload);
}

function signupUser(payload: SignupUserPayloadT) {
    return apiClient.post("/auth/register", payload);
}

function resendEmailVerification(payload: ResendEmailVerificationPayloadT) {
    return apiClient.post("/auth/resend-email", payload);
}

function verifyEmail(payload: VerifyEmailPayloadT) {
    return apiClient.get(
        `/auth/verify?verificationToken=${payload.verificationToken}`
    );
}

function startNewStream(payload: CreateStreamPayloadT) {
    return apiClient.post("/streams", payload);
}

function getAllStreams(payload?: GetAllStreamsPayloadT) {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(payload?.page ?? ""));
    searchParams.set("limit", String(payload?.limit ?? ""));
    return apiClient.get(`/streams?${searchParams}`);
}

function applyForStreamer(payload: FormData) {
    return apiClient.post("/user/apply-streamer", payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

function getStreamById(payload: GetStreamByIdPayloadT) {
    return apiClient.get(`/streams/${payload.streamId}`);
}

function getAllChatByStreamId(payload: GetStreamByIdPayloadT) {
    return apiClient.get(`/streams/${payload.streamId}/chats`);
}

function createPremiumChatOrder(payload: MakePremiumChatOrderPayloadT) {
    return apiClient.post(`/streams/${payload.streamId}/premium-chat`, payload);
}

function fetchAllApplications() {
    return apiClient.get(`/admin/streamer-applications`);
}

function downloadApplicationAsCsv() {
    return apiClient.get(`/admin/applications-csv`);
}

function acceptApplication(email: string) {
    return apiClient.post("/admin/accept-application", {
        email,
    });
}

function getYoutubeVideoData(videoUrl: string) {
    const searchParams = new URLSearchParams();
    searchParams.set("videoUrl", videoUrl);
    return apiClient.post(
        `/streams/fetchYoutubeData?${searchParams.toString()}`
    );
}

function ssoGoogleLogin(payload: SSOGoogleAuthPayloadT) {
    return apiClient.post(`/auth/sso/google/login`, payload);
}

function ssoGoogleRegister(payload: SSOGoogleAuthPayloadT) {
    return apiClient.post(`/auth/sso/google/register`, payload);
}

function createNewPlan(payload: CreatePlanPayloadT) {
    return apiClient.post("/user/create-plan", payload);
}

function fetchPaymentPlanDetails(payload: GetChannelPlanDetailPayloadT) {
    const searchParams = new URLSearchParams();
    searchParams.append("streamerId", String(payload.streamerId));
    return apiClient.get(`/streams/get-plans?${searchParams.toString()}`);
}

function startStreamerSubscription(payload: CreateSubscriptionPayloadT) {
    return apiClient.post("/user/subscribe", payload);
}

function getStreamerSubscriptionDetail(
    payload: GetStreamerSubscriptionDetailPayloadT
) {
    return apiClient.get(`/streams/subscription/${payload.streamerId}`);
}

function uploadCustomEmotes(payload: FormData) {
    return apiClient.post("/user/emotes", payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

function getEmoteByStreamerId(payload: { streamerId: number }) {
    return apiClient.get(`/user/emotes/${payload.streamerId}`);
}

function deleteEmoteByCode(payload: { code: string }) {
    return apiClient.delete(`/user/emote/${payload.code}`);
}

export {
    getUser,
    loginUser,
    apiClient,
    logoutUser,
    signupUser,
    verifyEmail,
    getStreamById,
    createNewPlan,
    getAllStreams,
    ssoGoogleLogin,
    startNewStream,
    applyForStreamer,
    ssoGoogleRegister,
    deleteEmoteByCode,
    acceptApplication,
    uploadCustomEmotes,
    getYoutubeVideoData,
    getEmoteByStreamerId,
    fetchAllApplications,
    getAllChatByStreamId,
    createPremiumChatOrder,
    fetchPaymentPlanDetails,
    resendEmailVerification,
    downloadApplicationAsCsv,
    startStreamerSubscription,
    getStreamerSubscriptionDetail,
};
