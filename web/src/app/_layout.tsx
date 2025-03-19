import { Outlet } from "react-router";
import { Toaster } from "../components/ui/sooner"
import { useAppSelector } from "../store";
import LoadingComp from "../components/loading";
import React from "react";

export default function RootLayout() {

  const appLoading = useAppSelector(state => state.app.appLoading)

  return (
    <main className="h-screen w-screen overflow-auto bg-neutral-950">
      {appLoading ?
        <LoadingComp />
        :
        <React.Fragment>
          <Outlet />
          <Toaster />
        </React.Fragment>
      }
    </main>
  )
}
