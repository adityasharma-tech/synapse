import { Outlet, useNavigate } from "react-router";
import { useAppSelector } from "../../store";
import React from "react";

export default function AuthLayout() {

  const app = useAppSelector(state => state.app)
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!app.appLoading && app.user) navigate('/dashboard')
  }, [app.appLoading])

  return (<Outlet/>)
}
