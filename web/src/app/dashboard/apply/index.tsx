import React from "react";
import TextInput from "../../../components/cui/TextInput";

import { useNavigate } from "react-router";
import { FormEventHandler, useCallback, useState } from "react";
import { useFetcher } from "../../../hooks/fetcher.hook";
import { useAppSelector } from "../../../store";
import axiosInstance from "../../../lib/axios";

export default function ApplyForStreamer() {
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.app.user);

  const { loading, handleFetch, serverRes } = useFetcher();

  const [formData, setFormData] = useState<{
    phoneNumber: string;
    upiId: string;
    otpVerified: boolean;
    otp: string;
    bankAccountNumber: string;
    bankIfsc: string;
    payoutType: "upi" | "bank";
  }>({
    phoneNumber: user?.phoneNumber ?? "",
    upiId: "",
    otpVerified: false,
    otp: "",
    bankAccountNumber: "",
    bankIfsc: "",
    payoutType: "upi",
  });

  const handleStreamer: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      /**
       * Select radio options for bank or upi id payout methods
       * address box,
       * phoneNumber with country code
       * steet address
       * city
       * state
       * pin code
       */
    },
    []
  );

  return (
    <React.Fragment>
      <header className="px-5 flex justify-between py-4">
        <img alt="Synapse" src="/T&W@2x.png" className="object-contain h-10" />
      </header>
      <div className="rounded-lg px-10 py-8 gap-y-1 h-[calc(100vh-115px)] flex flex-col justify-center items-center">
        <form onSubmit={handleStreamer}>
          <div>
            <h2 className="text-4xl font-bold text-center">
              Apply for streamer
            </h2>
          </div>
          <div className="flex gap-x-10 md:flex-row flex-col">
            <div>
              <TextInput
                required
                label="Name"
                disabled
                placeholder={"Jane"}
                value={`${user?.firstName} ${user?.lastName}`}
              />
              <TextInput
                label="Email"
                disabled
                required
                placeholder="username@company.com"
                type="email"
                value={user?.email}
              />
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

              <div className="flex justify-end pt-2">
                <span className="text-xs">
                  We are facing issues with msg91 otp verification.*
                </span>
                <button type="button" disabled className="btn btn-soft">
                  <span
                    hidden
                    className="loading loading-xs loading-spinner"
                  ></span>
                  Send otp
                </button>
              </div>
              <div id="captcha-renderer"></div>
              {false ? (
                <TextInput
                  label="Otp input"
                  disabled={!formData.otpVerified}
                  placeholder="******"
                  type="text"
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                />
              ) : null}
            </div>

            <div className="min-w-xs mt-4">
              <div>
                <span>Select your payout option.</span>
              </div>
              <div className="flex gap-x-2 py-3">
                <div
                  onClick={() =>
                    setFormData({ ...formData, payoutType: "upi" })
                  }
                  role="button"
                  tabIndex={0}
                  aria-selected={
                    formData.payoutType == "upi" ? "true" : "false"
                  }
                  className="flex cursor-pointer flex-col border border-transparent transition-all aria-selected:border-sky-300 aria-selected:bg-sky-300/10 gap-y-3 px-3 py-2 pb-4 bg-neutral-700/40 rounded-lg"
                >
                  <span className="text-lg font-semibold">UPI ID</span>
                  <span className="text-xs max-w-36">
                    directly though your upi id
                  </span>
                </div>
                <div
                  onClick={() =>
                    setFormData({ ...formData, payoutType: "bank" })
                  }
                  role="button"
                  tabIndex={0}
                  aria-selected={
                    formData.payoutType == "bank" ? "true" : "false"
                  }
                  className="flex cursor-pointer flex-col border border-transparent transition-all aria-selected:border-sky-300 aria-selected:bg-sky-300/10 gap-y-3 px-3 py-2 pb-4 bg-neutral-700/40 rounded-lg"
                >
                  <span className="text-lg font-semibold">Bank Account</span>
                  <span className="text-xs max-w-36">
                    through your bank account
                  </span>
                </div>
              </div>
              {formData.payoutType == "upi" ? <TextInput
                required={formData.payoutType == "upi"}
                label="UPI"
                type="email"
                onChange={(e)=>setFormData({...formData, upiId: e.target.value})}
                placeholder={"123456@upi"}
                value={formData.upiId}
              /> :
              <React.Fragment>
                <TextInput
                  label="Bank account number"
                  required={formData.payoutType == "bank"}
                  type="text"
                  placeholder="**************"
                  onChange={(e)=>setFormData({...formData, bankAccountNumber: e.target.value.trim().replace(" ", "")})}
                  value={formData.bankAccountNumber}
                />
                <TextInput
                  label="IFSC Code"
                  required={formData.payoutType == "bank"}
                  placeholder="**********"
                  type="text"
                  onChange={(e)=>setFormData({...formData, bankIfsc: e.target.value.trim().replace(" ", "")})}
                  value={formData.bankIfsc}
                />
              </React.Fragment>}
            </div>
          </div>
          <div className="pt-10 text-center">
            <button
              type="submit"
              className="py-2 g-recaptcha flex gap-x-3 justify-center items-center mx-auto min-w-xs bg-sky-600 rounded-md text-white font-medium disabled:bg-neutral-700 disabled:opacity-45"
            >
              <span
                data-loading={loading.toString()}
                className="loading data-[loading='true']:block hidden loading-spinner loading-xs"
              ></span>
              Apply
            </button>
          </div>
        </form>
      </div>
    </React.Fragment>
  );
}
