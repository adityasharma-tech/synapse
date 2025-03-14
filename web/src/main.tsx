import App from "./app";


import RootLayout from "./app/_layout";
import AuthLayout from "./app/auth/_layout";
import LoginPage from "./app/auth/login";
import SignupPage from "./app/auth/signup";
import VerifyPage from "./app/auth/verify";
import LogoutPage from "./app/user/logout";
import { NotFound } from "./app/_not-found";

import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { useAppDispatch, useAppSelector } from "./store";

import { fetchUser } from "./store/actions/user.actions";


export default function Main() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.app);
  useEffect(() => {
    dispatch(fetchUser());
  }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<App />} />
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="verify" element={<VerifyPage />} />
            <Route path="resend-email" element={<SignupPage />} />
            <Route path="forgot-password" element={<SignupPage />} />
          </Route>
          {user ? <Route path="user">
            <Route element={<SignupPage />} />
            <Route path="reset-password" element={<SignupPage />} />
            <Route path="logout" element={<LogoutPage />} />
          </Route> : null}
          {user ? <Route path="dashboard">
            <Route element={<SignupPage />} />
            <Route path="stream/:streamId" element={<SignupPage />} />
          </Route> : null}
          <Route path="stream/:streamId" element={<SignupPage />} />
          <Route path="*" element={<NotFound />} /> {/* Not found page */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
