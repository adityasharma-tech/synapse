import { Outlet } from "react-router";
import { Toast } from "../components/ui/toast"

export default function RootLayout() {
  return (
    <main className="h-screen w-screen overflow-auto bg-neutral-900">
      <Outlet/>
      <Toast/>
    </main>
  )
}
