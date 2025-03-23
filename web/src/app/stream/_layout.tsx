import { Outlet, useNavigate } from "react-router";
import { SocketProvider } from "../../hooks/socket.hook";
import { useAppSelector } from "../../store";
import React from "react";

export default function SocketLayout() {
  const user = useAppSelector((state) => state.app.user);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      const searchParams = new URLSearchParams()
      searchParams.set('redirect_uri', window.location.pathname)
      navigate(`/auth/login?${searchParams.toString()}`);
    }
  }, [user]);

  if (!user) return;

  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
}
