import { Outlet, useNavigate, useSearchParams } from "react-router";
import { SocketProvider } from "../../hooks/socket.hook";
import { useAppSelector } from "../../store";
import React, { useState } from "react";
import LoadingComp from "../../components/loading";

export default function SocketLayout() {
  const user = useAppSelector((state) => state.app?.user);
  const navigate = useNavigate();

  const [streamId, setStreamId] = useState<null | string>(null);

  React.useEffect(() => {
    if (!user) {
      const searchParams = new URLSearchParams()
      searchParams.set('redirect_uri', window.location.pathname)
      navigate(`/auth/login?${searchParams.toString()}`);
    }
  }, [user]);

  const [searchParams] = useSearchParams();

  React.useEffect(()=>{
    const id = searchParams.get('streamId')
    setStreamId(id);
  }, [user])

  if(!streamId) return <LoadingComp/>;

  if (!user) return;

  return (
    <SocketProvider streamId={streamId}>
      <Outlet />
    </SocketProvider>
  );
}
