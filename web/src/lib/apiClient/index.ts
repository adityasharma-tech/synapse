import axios, { CreateAxiosDefaults } from "axios";
import {
  ApplyForStreamerPayloadT,
  GetAllStreamsPayloadT,
  GetStreamByIdPayloadT,
  LoginUserPayloadT,
  ResendEmailVerificationPayloadT,
  SignupUserPayloadT,
  StartNewStreamPayloadT,
  VerifyEmailPayloadT,
} from "./intefaces";

const baseHost = import.meta.env.VITE_BACKEND_HOST;

const axiosConfig: CreateAxiosDefaults = {
  baseURL: `${baseHost}/api/v1`,
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
        return apiClient(error.config); // retry the previous request
      } catch (refreshTokenErr) {
        console.error(`Error updating refresh token: ${error.message}`);
        return Promise.reject(refreshTokenErr);
      }
    }
    return Promise.reject(error);
  }
);

function getUser() {
  return apiClient.get("/user");
}

function logoutUser() {
  return apiClient.get("/user/logout");
}

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

function startNewStream(payload: StartNewStreamPayloadT) {
  return apiClient.post("/streams", payload);
}

function getAllStreams(payload?: GetAllStreamsPayloadT) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(payload?.page ?? ""));
  searchParams.set("limit", String(payload?.limit ?? ""));
  return apiClient.get(`/streams?${searchParams}`);
}

function applyForStreamer(payload: ApplyForStreamerPayloadT) {
  return apiClient.post("/user/apply-streamer", payload);
}

function getStreamById(payload: GetStreamByIdPayloadT) {
  return apiClient.get(`/streams/${payload.streamId}`);
}

function getAllChatByStreamId(payload: GetStreamByIdPayloadT){
  return apiClient.get(`streams/${payload.streamId}/chats`)
}

export {
  getUser,
  logoutUser,
  loginUser,
  signupUser,
  resendEmailVerification,
  verifyEmail,
  startNewStream,
  getAllStreams,
  applyForStreamer,
  apiClient,
  getStreamById,
  getAllChatByStreamId
};
