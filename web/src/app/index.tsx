import { Link } from "react-router";
import PrimaryButton from "../components/ui/button";

export default function Home() {
  return (
    <main className="h-screen p-10 w-screen bg-neutral-100 dark:bg-neutral-950">
      <header className="px-5 flex justify-between py-4">
        <img
          alt="Synapse"
          src="/T&W@2x.png"
          className="object-contain h-10"
        />
        <div className="flex gap-x-4 items-center">
          <Link to="/auth/signup">
            <PrimaryButton bgClr="emerald">
              Sign Up{" "}
              <svg className="size-2 rotate-90" viewBox="0 0 24 24">
                <path className="fill-neutral-100" d="M21 21H3l9-18z" />
              </svg>
            </PrimaryButton>
          </Link>
        </div>
      </header>
      <div className="flex flex-col gap-y-10 justify-center items-center w-full py-20">
        <h1 style={{
          fontFamily: "Funnel Display, serif",
          fontOpticalSizing: "auto",
          fontStyle: "normal"
        }} className="text-5xl text-center font-medium leading-14 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
          A very simple chat streaming platform
          for <span className="bg-clip-text text-transparent bg-gradient-to-b from-emerald-500 to-emerald-800">streamers</span>.
        </h1>
        <button className="btn">View Dashboard</button>
      </div>
    </main>
  );
}
