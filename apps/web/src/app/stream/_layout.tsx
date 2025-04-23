import { Outlet, useNavigate, useParams } from "react-router";
import { SocketProvider } from "../../hooks/socket.hook";
import { useAppSelector } from "../../store";
import React from "react";
import LoadingComp from "../../components/loading";

export default function SocketLayout() {
  const user = useAppSelector((state) => state.app?.user);
  const navigate = useNavigate();
  const { streamId } = useParams();

  React.useEffect(() => {
    if (!user) {
      const searchParams = new URLSearchParams();
      searchParams.set("redirect_uri", window.location.pathname);
      navigate(`/auth/login?${searchParams.toString()}`);
    }
  }, [user]);

  if (!streamId) return <LoadingComp />;

  if (!user) return;

  return (
    <SocketProvider streamId={streamId}>
      <Outlet />
    </SocketProvider>
  );
}
