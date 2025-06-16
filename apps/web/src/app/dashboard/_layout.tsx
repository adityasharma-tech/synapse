import React from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router";
import { useAppSelector } from "../../store";

export default function DashboardLayout() {
    const user = useAppSelector((state) => state.app.user);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    React.useEffect(() => {
        const redirectUri = searchParams.get("redirect_uri");
        if (!user)
            if (redirectUri) navigate(redirectUri);
            else navigate("/");
    }, [user, searchParams]);

    return <Outlet />;
}
