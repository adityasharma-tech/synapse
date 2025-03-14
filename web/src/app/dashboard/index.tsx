import React from "react";
import Header from "../../components/header";
import PrimaryButton from "../../components/ui/button";

export default function DashboardPage() {
  return (
    <React.Fragment>
        <Header>
            <PrimaryButton className="text-md font-medium" bgClr="emerald">Start new stream</PrimaryButton>
        </Header>
        <section className="flex items-center h-[calc(100vh-72px)] justify-center">
            <span>Dashboard is not loading.</span>
        </section>
    </React.Fragment>
  )
}
