import "./index.css";

import Main from "./main";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics } from "@vercel/analytics/react";
import { env } from "./lib/utils";

const googleClientId = env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={googleClientId}>
        <Provider store={store}>
            <Main />
            <Analytics />
        </Provider>
    </GoogleOAuthProvider>
);
