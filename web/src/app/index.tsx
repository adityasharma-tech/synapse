import Header from "../components/header";

export default function Home() {
  return (
    <main className="h-screen p-10 w-screen bg-neutral-100 dark:bg-neutral-950">
      <Header />
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
