import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <main className="h-screen w-screen overflow-auto bg-neutral-900">
      <Outlet/>
    </main>
  )
}
