import { Outlet } from "react-router";
import { SocketProvider } from "../../hooks/socket.hook";

export default function SocketLayout() {

  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
}
