import { Outlet } from "react-router";
import { Toaster } from "../components/ui/sooner";
import { useAppSelector } from "../store";
import LoadingComp from "../components/loading";
import React from "react";

export default function RootLayout() {
    // app loading state from whole app context from redux state management to show a loading screen whenever a loading is going on
    const appLoading = useAppSelector((state) => state.app.appLoading);

    return (
        <main className="h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-50">
            {appLoading ? (
                <LoadingComp />
            ) : (
                <React.Fragment>
                    <Outlet />
                    <Toaster />
                </React.Fragment>
            )}
        </main>
    );
}
