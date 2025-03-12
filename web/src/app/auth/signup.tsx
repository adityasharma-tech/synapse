import React from "react";

export default function SignupPage() {
    return (
        <React.Fragment>
            <header className="px-5 flex justify-between py-4">
                <img
                    alt="Synapse"
                    src="/T&W@2x.png"
                    className="object-contain h-10"
                />
            </header>
            <div className="h-full w-full flex justify-center items-center">
                <div className="rounded-lg px-10 py-8 gap-y-1 flex flex-col justify-center items-center">
                    <div>
                        <h2>Log into Synapse</h2>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <label style={{
                            fontSize: "14px"
                        }} className="font-medium dark:text-white">Email address</label>
                        <input placeholder="username@company.com" type="email" className="focus:outline-none p-2 min-w-sm text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm"/>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <label style={{
                            fontSize: "14px"
                        }} className="font-medium dark:text-white">Email address</label>
                        <input placeholder="username@company.com" type="email" className="focus:outline-none p-2 min-w-sm text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm"/>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <label style={{
                            fontSize: "14px"
                        }} className="font-medium dark:text-white">Email address</label>
                        <input placeholder="username@company.com" type="email" className="focus:outline-none p-2 min-w-sm text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm"/>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
