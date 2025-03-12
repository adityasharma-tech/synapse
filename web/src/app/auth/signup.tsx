import React, { FormEventHandler, useState } from "react";
import { Link } from "react-router";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        termsCheked: false
    })

    const toast = 

    const handleSignup: FormEventHandler<HTMLFormElement> = async function (e) {
        e.preventDefault();
        if(!formData.termsCheked) {}

        
    }
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
                <form onSubmit={handleSignup} className="max-w-lg">
                    <div>
                        <h2 className="text-4xl font-bold text-center">Signup on Synapse</h2>
                    </div>
                    <div className="flex gap-x-2">
                        <div className="flex flex-col gap-y-2 mt-10">
                            <label style={{
                                fontSize: "14px"
                            }} className="font-medium dark:text-white">First name <span className="text-red-600">*</span></label>
                            <input
                                required
                                placeholder="Jane"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="focus:outline-none p-2 w-full text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm" />
                        </div>
                        <div className="flex flex-col gap-y-2 mt-10">
                            <label style={{
                                fontSize: "14px"
                            }} className="font-medium dark:text-white">Last name <span className="text-red-600">*</span></label>
                            <input
                                required
                                placeholder="Doe"
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="focus:outline-none p-2 w-full text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-2 mt-4">
                        <label style={{
                            fontSize: "14px"
                        }} className="font-medium dark:text-white">Phone number <span className="text-red-600">*</span></label>
                        <input
                            required
                            placeholder="+91 12312 12312"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="focus:outline-none p-2 w-full text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm" />
                    </div>
                    <div className="flex flex-col gap-y-2 mt-4">
                        <label style={{
                            fontSize: "14px"
                        }} className="font-medium dark:text-white">Email address <span className="text-red-600">*</span></label>
                        <input
                            required
                            placeholder="username@company.com"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="focus:outline-none p-2 w-full text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm" />
                    </div>
                    <div className="flex flex-col gap-y-2 mt-4">
                        <label style={{
                            fontSize: "14px"
                        }} className="font-medium dark:text-white">Password <span className="text-red-600">*</span></label>
                        <input
                            required
                            placeholder="*******"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="focus:outline-none p-2 w-full text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm" />
                    </div>
                    <div className="flex gap-x-2 items-center mt-3 justify-start">
                        <input value={formData.termsCheked.toString()} onChange={(e)=>setFormData({...formData, termsCheked: e.target.value === "true" ? true : false})} id="terms-services" type="checkbox" />
                        <label htmlFor="terms-services" className="text-sm">By clicking on signup you are aggring our <a href="/legal/terms-and-conditions" className="text-sky-600 hover:underline">terms & conditions</a></label>
                    </div>
                    <div className="pt-10 text-center">
                        <button type="submit" className="py-2 min-w-xs bg-sky-600 rounded-md text-white font-medium disabled:bg-neutral-700 disabled:opacity-45">
                            Create account
                        </button>
                    </div>
                </form>
                <div className="mt-auto">
                    Already have an account? <Link className="text-sky-600 hover:underline" to="/auth/login">Log in</Link> instead
                </div>
            </div>
        </React.Fragment>
    )
}
