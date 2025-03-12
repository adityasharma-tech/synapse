import React from "react";
import { Link } from "react-router";

export default function LoginPage() {
    return (
        <React.Fragment>
            <header className="px-5 flex justify-between py-4">
                <img
                    alt="Synapse"
                    src="/T&W@2x.png"
                    className="object-contain h-10"
                />
            </header>
            <div className="rounded-lg px-10 py-8 gap-y-1 h-[calc(100vh-115px)] flex flex-col justify-center items-center mt-10">
                <form className="min-w-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-center">Log into Synapse</h2>
                    </div>
                    <div className="flex flex-col gap-y-2 mt-10">
                        <label style={{
                            fontSize: "14px"
                        }} className="font-medium dark:text-white">Username or Email Address<span className="text-red-600">*</span></label>
                        <input
                            required
                            placeholder="username@company.com"
                            type="text"
                            className="focus:outline-none p-2 w-full text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm" />
                    </div>
                    <div className="flex flex-col gap-y-2 mt-4">
                        <label style={{
                            fontSize: "14px"
                        }} className="font-medium dark:text-white">Password <span className="text-red-600">*</span></label>
                        <input
                            required
                            placeholder="********"
                            type="password"
                            className="focus:outline-none p-2 w-full text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm" />
                    </div>
                    <div className="pt-10 text-center">
                        <button type="submit" className="py-2 min-w-[200px] bg-sky-600 rounded-md text-white font-medium disabled:bg-neutral-700 disabled:opacity-45">
                            Login
                        </button>
                    </div>
                </form>
                <div className="mt-auto">
                    Already have an account? <Link className="text-sky-600 hover:underline" to="/auth/signup">Sign up</Link> instead
                </div>
            </div>
        </React.Fragment>
    )
}
