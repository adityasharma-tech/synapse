import { Outlet, useNavigate, useSearchParams } from "react-router";
import { useAppSelector } from "../../store";
import React from "react";

// a wrapper for authentication pages to make sure if user is logged in then
// redirect it to dashboard or if not logged in make sure it can't access the dashbord page
export default function AuthLayout() {
    const app = useAppSelector((state) => state.app);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    React.useEffect(() => {
        if (!app.appLoading && app.user) {
            if (searchParams.has("redirect_uri"))
                navigate(searchParams.get("redirect_uri") ?? "");
            else navigate("/dashboard");
        }
    }, [app.appLoading]);

    return <Outlet />;
}
