import App from "./app";


import RootLayout from "./app/_layout";
import LoginPage from "./app/auth/login";
import SignupPage from "./app/auth/signup";
import VerifyPage from "./app/auth/verify";

import { useEffect } from "react";
import { fetchUser } from "./store/reducers/app.reducer";
import { ErrorBoundary } from "./app/error";
import { BrowserRouter, Route, Routes } from "react-router";
import { useAppDispatch, useAppSelector } from "./store";

export default function Main() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state=>state.app);
  useEffect(()=>{
    // dispatch(fetchUser());
  }, [])
  return (
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
          {user ? <Route path="user">
            <Route element={<SignupPage />} />
            <Route path="reset-password" element={<SignupPage />} />
          </Route> : null}
          <Route path="dashboard">
            <Route element={<SignupPage />} />
            <Route path="stream/:streamId" element={<SignupPage />} />
          </Route>
          <Route path="stream/:streamId" element={<SignupPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
