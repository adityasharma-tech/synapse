import React from "react";
import TextInput from "../../../components/cui/TextInput";

import { useNavigate } from "react-router";
import { FormEventHandler, useCallback, useState } from 'react'
import { useFetcher } from "../../../hooks/fetcher.hook";
import { useAppSelector } from "../../../store";
import axiosInstance from "../../../lib/axios";

export default function ApplyForStreamer() {
    const navigate = useNavigate();

    const user = useAppSelector(state => state.app.user);

    const { loading, handleFetch, serverRes } = useFetcher();


    const [formData, setFormData] = useState({
        phoneNumber: user?.phoneNumber,
        upiId: "payment@upi",
        otpVerified: false,
        otp: ""
    })


    const handleStreamer: FormEventHandler<HTMLFormElement> = useCallback(async (e) => {
        e.preventDefault();
        
        
    }, [])


    return (
        <React.Fragment>
            <header className="px-5 flex justify-between py-4">
                <img
                    alt="Synapse"
                    src="/T&W@2x.png"
                    className="object-contain h-10"
                />
            </header>
            <div className="rounded-lg px-10 py-8 gap-y-1 h-[calc(100vh-115px)] flex flex-col justify-center items-center">
                <form onSubmit={handleStreamer} className="max-w-lg">
                    <div>
                        <h2 className="text-4xl font-bold text-center">Apply for streamer</h2>
                    </div>
                    <TextInput
                        required
                        label="Name"
                        disabled
                        placeholder={"Jane"}
                        value={`${user?.firstName} ${user?.lastName}`} />
                    <TextInput
                        label="Email"
                        disabled
                        required
                        placeholder="username@company.com"
                        type="email"
                        value={user?.email} />
                    <TextInput
                        label="Phone number"
                        disabled={loading}
                        required
                        placeholder="+91 12312 12312"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                    <div className="flex justify-end pt-2">
                        <span className="text-xs">We are facing issues with msg91 otp verification.*</span>
                        <button type="button" disabled className="btn btn-soft"><span hidden className="loading loading-xs loading-spinner"></span>Send otp</button>
                    </div>
                    <div id="captcha-renderer">

                    </div>
                    {false ? <TextInput
                        label="Otp input"
                        disabled={!formData.otpVerified}
                        placeholder="******"
                        type="text"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })} /> : null}
                    <TextInput
                        required
                        label="UPI ID"
                        disabled={loading}
                        placeholder="payment@upi"
                        type="text"
                        value={formData.upiId}
                        onChange={(e) => setFormData({ ...formData, upiId: e.target.value })} />
                    <div className="pt-10 text-center">
                        <button disabled type="submit" className="py-2 g-recaptcha flex gap-x-3 justify-center items-center mx-auto min-w-xs bg-sky-600 rounded-md text-white font-medium disabled:bg-neutral-700 disabled:opacity-45">
                            <span data-loading={loading.toString()} className="loading data-[loading='true']:block hidden loading-spinner loading-xs"></span>
                            Apply
                        </button>
                    </div>
                </form>
            </div>
        </React.Fragment>
    )
}
