import axios, { CreateAxiosDefaults } from "axios";
import {
  ApplyForStreamerPayloadT,
  GetAllStreamsPayloadT,
  GetStreamByIdPayloadT,
  LoginUserPayloadT,
  MakePremiumChatOrderPayloadT,
  ResendEmailVerificationPayloadT,
  SignupUserPayloadT,
  StartNewStreamPayloadT,
  VerifyEmailPayloadT,
} from "./intefaces";

// backend host
const baseHost = import.meta.env.VITE_BACKEND_HOST;

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
  return apiClient.get(`/streams/${payload.streamId}/chats`)
}

function createPremiumChatOrder(payload: MakePremiumChatOrderPayloadT){
  return apiClient.post(`/streams/${payload.streamId}/premium-chat`, payload)
}

function fetchAllApplications(){
  return apiClient.get(`/admin/streamer-applications`)
}

function downloadApplicationAsCsv(){
  return apiClient.get(`/admin/applications-csv`)
}

function acceptApplication(email: string){
  return apiClient.post('/admin/accept-application', {
    email
  })
}

export {
  getUser,
  loginUser,
  apiClient,
  logoutUser,
  signupUser,
  verifyEmail,
  getStreamById,
  getAllStreams,
  startNewStream,
  applyForStreamer,
  acceptApplication,
  fetchAllApplications,
  getAllChatByStreamId,
  createPremiumChatOrder,
  resendEmailVerification,
  downloadApplicationAsCsv
};
