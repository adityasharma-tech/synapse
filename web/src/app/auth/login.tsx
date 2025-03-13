import { Link, useNavigate } from "react-router";
import React, { FormEventHandler, useState } from "react";
import TextInput from "../../components/cui/TextInput";
import { useFetcher } from "../../hooks/fetcher.hook";
import axiosInstance from "../../lib/axios.config";

export default function LoginPage() {

    const { handleFetch, loading, serverRes } = useFetcher()

    const navigator = useNavigate()

    const [formData, setFormData] = useState({
        dataField: "",
        password: ""
    })

    const handleLoginSubmit: FormEventHandler<HTMLFormElement> = async function (e) {
        e.preventDefault();

        await handleFetch(axiosInstance.post('/auth/login', {
            email: formData.dataField.includes("@") ? formData.dataField : undefined,
            username: formData.dataField.includes("@") ? undefined : formData.dataField,
            password: formData.password
        }))
        if (serverRes?.success) {
            navigator('/dashboard')
        }
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
                <form onSubmit={handleLoginSubmit} className="min-w-sm">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-center">Log into Synapse</h2>
                    </div>
                    <TextInput
                        required
                        value={formData.dataField}
                        onChange={(e)=>setFormData({...formData, dataField: e.target.value.trim().toLowerCase()})}
                        placeholder="username@company.com"
                        label="Username or Email Address" />

                    <TextInput
                        value={formData.password}
                        onChange={(e)=>setFormData({...formData, password: e.target.value})}
                        type="password"
                        required
                        placeholder="********"
                        label="Password" />


                    <div className="pt-10 text-center">
                        <button type="submit" className="py-2 flex gap-x-2 justify-center items-center mx-auto min-w-[200px] bg-sky-600 rounded-md text-white font-medium disabled:bg-neutral-700 disabled:opacity-45">
                        <span data-loading={loading.toString()} className="loading data-[loading='true']:block hidden loading-spinner loading-xs"></span>
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
