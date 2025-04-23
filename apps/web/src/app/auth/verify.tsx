import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { requestHandler } from "../../lib/requestHandler";
import { resendEmailVerification, verifyEmail } from "../../lib/apiClient";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigator = useNavigate();

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    handleVerifyEmail();
  }, []);

  async function handleVerifyEmail() {
    const verificationToken = searchParams.get("verificationToken");
    if (verificationToken) {
      await requestHandler(
        verifyEmail({
          verificationToken,
        }),
        () => {
          navigator("/dashboard");
        },
        setLoading,
      );
    }
  }

  async function handleResendEmailVerification() {
    const email = atob(searchParams.get("email") ?? "");
    if (email) {
      await requestHandler(
        resendEmailVerification({
          email,
        }),
        setLoading,
      );
    }
  }

  return (
    <React.Fragment>
      <header className="px-5 flex justify-between py-4">
        <img alt="Synapse" src="/T&W@2x.png" className="object-contain h-10" />
      </header>
      <div className="rounded-lg px-10 py-8 gap-y-1 h-[calc(100vh-115px)] flex flex-col justify-center items-center">
        <div>
          <h2 className="text-4xl font-bold text-center">Verify your email</h2>
        </div>
        <div className="mt-5 max-w-md text-center">
          {searchParams.get("email") ? (
            <span>
              We've sent an email to{" "}
              <strong>{atob(searchParams.get("email") ?? "")}</strong>. Continue
              account creation using the link via email.
            </span>
          ) : null}
          <br />
          {searchParams.get("verificationToken") ? (
            <div className="flex gap-x-3">
              {loading ? (
                <span className="loading loading-spinner loading-xl"></span>
              ) : null}
              {searchParams.get("verificationToken") ? (
                <span>Please wait! We are verififying your email.</span>
              ) : null}
            </div>
          ) : null}
        </div>
        {searchParams.get("email") ? (
          <div className="pt-3 text-center flex flex-col gap-y-2">
            <button
              onClick={() => window.location.reload()}
              type="submit"
              className="py-1.5 flex gap-x-3 justify-center items-center mx-auto px-10 border-neutral-300 hover:bg-neutral-800 bg-transparent border rounded-md text-white font-medium disabled:bg-neutral-700 disabled:opacity-45"
            >
              <span className="loading data-[loading='true']:block hidden loading-spinner loading-xs"></span>
              <span>Refresh Page</span>
            </button>
            <button
              disabled={loading}
              onClick={handleResendEmailVerification}
              type="submit"
              className="py-1.5 flex gap-x-3 justify-center items-center mx-auto px-10 bg-sky-600 rounded-md text-white font-medium disabled:bg-neutral-700 disabled:opacity-45"
            >
              <span
                data-loading={loading}
                className="loading data-[loading='true']:block hidden loading-spinner loading-xs"
              ></span>
              <span>Resend email</span>
            </button>
          </div>
        ) : null}
      </div>
    </React.Fragment>
  );
}
