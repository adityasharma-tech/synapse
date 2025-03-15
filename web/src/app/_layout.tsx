import { Outlet } from "react-router";
import { Toaster } from "../components/ui/sooner"
import { FetcherProvider } from "../hooks/fetcher.hook";
import { useAppSelector } from "../store";
import LoadingComp from "../components/loading";

export default function RootLayout() {

  const appLoading = useAppSelector(state => state.app.appLoading)

  return (
    <main className="h-screen w-screen overflow-auto bg-neutral-900 stroke-red-700">
      {appLoading ?
        <LoadingComp />
        :
        <FetcherProvider>
          <Outlet />
          <Toaster />
        </FetcherProvider>
      }
    </main>
  )
}
