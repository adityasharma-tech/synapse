import { env } from "../lib/utils";

// constant declaration for msg91 configuration
const msgWidgetId = env.VITE_WIDGET_ID;
const msgAuthToken = env.VITE_TOKEN_AUTH;

//
const hostBaseUrl = env.VITE_BACKEND_HOST + "/api/v1";
const githubUrl = "https://github.com/adityasharma-tech/synapse.git";

// razorpay key id import only
const razorpayKeyId = env.VITE_RAZORPAY_KEY_ID;

export { msgAuthToken, msgWidgetId, hostBaseUrl, razorpayKeyId, githubUrl };
