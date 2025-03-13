import "./index.css";
import App from "./app";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import LoginPage from "./app/auth/login";
import SignupPage from "./app/auth/signup";
import { ErrorBoundary } from "./app/error";
import RootLayout from "./app/_layout";
import VerifyPage from "./app/auth/verify";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />} errorElement={<ErrorBoundary />}>
          <Route index element={<App />} />
          <Route path="auth">
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="verify" element={<VerifyPage />} />
            <Route path="resend-email" element={<SignupPage />} />
            <Route path="forgot-password" element={<SignupPage />} />
          </Route>
          <Route path="user">
            <Route element={<SignupPage />} />
            <Route path="reset-password" element={<SignupPage />} />
          </Route>
          <Route path="dashboard">
            <Route element={<SignupPage />} />
            <Route path="stream/:streamId" element={<SignupPage />} />
          </Route>
          <Route path="stream/:streamId" element={<SignupPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
);
