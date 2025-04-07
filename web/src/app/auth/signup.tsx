import React from "react";
import TextInput from "../../components/cui/TextInput";

import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { FormEventHandler, useCallback, useState } from "react";
import { requestHandler } from "../../lib/requestHandler";
import { signupUser } from "../../lib/apiClient";

export default function SignupPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "Jon",
    lastName: "Doe",
    email: "aditya@adityasharma.live",
    phoneNumber: "+91 123123 1231",
    password: "testpassword",
    termsCheked: false,
  });

  const handleSignup: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (!formData.termsCheked)
        return toast("You need to aggree to our terms & conditions first.");

      await requestHandler(
        signupUser({
          ...formData,
        }),
        setLoading,
        () => {
          const searchParams = new URLSearchParams();
          searchParams.append("email", btoa(formData.email));
          navigate(`/auth/verify?${searchParams.toString()}`);
        },
      );
    },
    [formData, toast, requestHandler, signupUser, navigate],
  );

  return (
    <React.Fragment>
      <header className="px-5 flex justify-between py-4">
        <img alt="Synapse" src="/T&W@2x.png" className="object-contain h-10" />
      </header>
      <div className="rounded-lg px-10 py-8 gap-y-1 h-[calc(100vh-115px)] flex flex-col justify-center items-center mt-10">
        <form onSubmit={handleSignup} className="max-w-lg">
          <div>
            <h2 className="text-4xl font-bold text-center">
              Signup on Synapse
            </h2>
          </div>
          <div className="flex gap-x-2 mt-8">
            <TextInput
              label="First name"
              disabled={loading}
              required
              placeholder={"Jane"}
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <TextInput
              label="Last name"
              disabled={loading}
              required
              placeholder="Doe"
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>
          <TextInput
            label="Phone number"
            disabled={loading}
            required
            placeholder="+91 12312 12312"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
          <TextInput
            label="Email"
            disabled={loading}
            required
            placeholder="username@company.com"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value.trim().toLowerCase(),
              })
            }
          />
          <TextInput
            label="Password"
            disabled={loading}
            required
            placeholder="*******"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <div className="flex gap-x-2 items-center mt-3 justify-start">
            <input
              disabled={loading}
              checked={formData.termsCheked}
              onChange={() =>
                setFormData({ ...formData, termsCheked: !formData.termsCheked })
              }
              id="terms-services"
              type="checkbox"
            />
            <label htmlFor="terms-services" className="text-sm">
              By clicking on signup you are aggring our{" "}
              <a
                href="/legal/terms-and-conditions"
                className="text-sky-600 hover:underline"
              >
                terms & conditions
              </a>
            </label>
          </div>
          <div className="pt-10 text-center">
            <button
              disabled={loading}
              type="submit"
              className="py-2 flex gap-x-3 justify-center items-center mx-auto min-w-xs bg-sky-600 rounded-md text-white font-medium disabled:bg-neutral-700 disabled:opacity-45"
            >
              <span
                data-loading={loading.toString()}
                className="loading data-[loading='true']:block hidden loading-spinner loading-xs"
              ></span>
              Create account
            </button>
          </div>
        </form>
        <div className="mt-auto">
          Already have an account?{" "}
          <Link className="text-sky-600 hover:underline" to="/auth/login">
            Log in
          </Link>{" "}
          instead
        </div>
      </div>
    </React.Fragment>
  );
}
