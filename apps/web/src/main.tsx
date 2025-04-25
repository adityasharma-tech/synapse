// pages imports
import App from "./app";
import Stream from "./app/stream";
import LoginPage from "./app/auth/login";
import SignupPage from "./app/auth/signup";
import VerifyPage from "./app/auth/verify";
import LogoutPage from "./app/user/logout";
import DashboardPage from "./app/dashboard";
import ApplyForStreamer from "./app/dashboard/apply";
import StreamerApplicationsPage from "./app/dashboard/streamer-applications";

// layouts
import RootLayout from "./app/_layout";
import { NotFound } from "./app/_not-found";
import AuthLayout from "./app/auth/_layout";
import SocketLayout from "./app/stream/_layout";
import DashboardLayout from "./app/dashboard/_layout";

import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { useAppDispatch, useAppSelector } from "./store";
import { fetchUser } from "./store/actions/user.actions";

export default function Main() {
    const dispatch = useAppDispatch();

    // user from the redux state
    const user = useAppSelector((state) => state.app.user);

    // this line fetches user every time user reload it's page and set user data to the redux state;
    useEffect(() => {
        dispatch(fetchUser());
    }, [dispatch]);

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
                        <Route
                            path="forgot-password"
                            element={<SignupPage />}
                        />
                    </Route>
                    <Route path="user">
                        <Route index element={<SignupPage />} />
                        <Route path="reset-password" element={<SignupPage />} />
                        <Route path="logout" element={<LogoutPage />} />
                    </Route>
                    {user ? (
                        <Route path="dashboard" element={<DashboardLayout />}>
                            <Route index element={<DashboardPage />} />
                            <Route
                                path="apply"
                                element={<ApplyForStreamer />}
                            />
                            {user.role == "admin" ? (
                                <Route
                                    path="streamer-applications"
                                    element={<StreamerApplicationsPage />}
                                />
                            ) : null}
                        </Route>
                    ) : null}
                    <Route element={<SocketLayout />}>
                        <Route path="stream/:streamId" element={<Stream />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />{" "}
                    {/* Not found page */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
