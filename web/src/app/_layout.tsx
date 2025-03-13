import { Outlet } from "react-router";
import { Toaster } from "../components/ui/sooner"
import { FetcherProvider } from "../hooks/fether.hook";
import { useCookies } from "react-cookie";

export default function RootLayout() {
  const [cookies] = useCookies()

  console.log(cookies)
  return (
    <main className="h-screen w-screen overflow-auto bg-neutral-900 stroke-red-700">
        <FetcherProvider>
          <Outlet />
          <Toaster />
        </FetcherProvider>
    </main>
  )
}
