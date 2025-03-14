import { Outlet, useNavigate } from "react-router";
import { useAppSelector } from "../../store";
import React from "react";

export default function AuthLayout() {

  const app = useAppSelector(state => state.app)
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!app.appLoading && app.user) navigate('/dashboard')
  }, [app.appLoading])

  if(app.appLoading)
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col gap-y-5">
        <span className="text-2xl">Loading...</span>
        <div className="flex gap-x-3 justify-center">
          <span className="loading loading-bars loading-lg"></span>
        </div>
      </div>
    </div>
  )
  else return (<Outlet/>)
}
