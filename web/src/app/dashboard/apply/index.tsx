import React from "react";
import TextArea from "../../../components/cui/TextArea";
import TextInput from "../../../components/cui/TextInput";

import { toast } from "sonner";
import { loadScript } from "../../../lib/utils";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../store";
import { requestHandler } from "../../../lib/requestHandler";
import { applyForStreamer } from "../../../lib/apiClient";
import { msgAuthToken, msgWidgetId } from "../../../lib/constants";
import { FormEventHandler, useCallback, useState, useRef } from "react";

export default function ApplyForStreamer() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const user = useAppSelector((state) => state.app.user);

  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const [inputData, setInputData] = useState<{
    phoneNumber: string;
    otpVerified: boolean;
    otp: string;
    bankAccountNumber: string;
    bankIfsc: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    youtubeChannelName: string;
    panNumber: string;
  }>({
    phoneNumber: user?.phoneNumber ?? "",
    otpVerified: false,
    otp: "",
    city: "",
    state: "",
    pinCode: "",
    address: "",
    bankIfsc: "",
    bankAccountNumber: "",
    youtubeChannelName: "",
    panNumber: "",
  });

  const handleStreamer: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (!inputData.phoneNumber.includes("+"))
        return toast("Please include country code with phone number");

      setLoading(true);

      const configuration = {
        widgetId: msgWidgetId,
        tokenAuth: msgAuthToken,
        identifier: inputData.phoneNumber,
        exposeMethods: "false", // When true will expose the methods for OTP verification. Refer 'How it works?' for more details
        success: async (data: any) => {
          const bodyFormData = new FormData();

          if (
            !documentInputRef.current ||
            !documentInputRef.current.files ||
            documentInputRef.current.files.length <= 0
          ) {
            setLoading(false);
            return toast("Please select your kyc document first.");
          }

          bodyFormData.append("document", documentInputRef.current.files[0]);
          bodyFormData.append("bankAccountNumber", inputData.bankAccountNumber);
          bodyFormData.append("panNumber", inputData.panNumber);
          bodyFormData.append("bankIfsc", inputData.bankIfsc);
          bodyFormData.append("city", inputData.city);
          bodyFormData.append("phoneNumber", inputData.phoneNumber);
          bodyFormData.append("postalCode", inputData.pinCode);
          bodyFormData.append("state", inputData.state);
          bodyFormData.append("streetAddress", inputData.address);
          bodyFormData.append(
            "youtubeChannelName",
            inputData.youtubeChannelName
          );
          bodyFormData.append("authToken", data.message);

          await requestHandler(
            applyForStreamer(bodyFormData),
            setLoading,
            () => {
              navigate("/dashboard");
            }
          );
        },
        failure: (error: any) => {
          // handle error
          console.log("failure reason", error);
          toast("Faild to verify your phone number");
          setLoading(false);
        },
      };

      // @ts-expect-error
      window.initSendOTP(configuration);
    },
    [
      inputData,
      toast,
      requestHandler,
      applyForStreamer,
      setLoading,
      navigate,
      msgAuthToken,
      msgWidgetId,
    ]
  );

  React.useEffect(() => {
    (async () => {
      const res = await loadScript(
        "https://control.msg91.com/app/assets/otp-provider/otp-provider.js"
      );
      if (!res) throw Error("Failed to load msg91 script.");
    })();
  }, []);

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
                placeholder="+91xxxxxxxxxx"
                type="tel"
                value={inputData.phoneNumber}
                onChange={(e) => {
                  setInputData({
                    ...inputData,
                    phoneNumber: e.target.value.trim().replace(" ", ""),
                  });
                }}
              />
              <TextArea
                required
                label="Address"
                disabled={loading}
                placeholder="Address here"
                value={inputData.address}
                onChange={(e) =>
                  setInputData({ ...inputData, address: e.target.value })
                }
              />

              <TextInput
                label="City"
                disabled={loading}
                required
                placeholder="New york"
                type="text"
                value={inputData.city}
                onChange={(e) =>
                  setInputData({ ...inputData, city: e.target.value })
                }
              />

              <TextInput
                label="Pincode"
                disabled={loading}
                required
                placeholder="123456"
                type="tel"
                value={inputData.pinCode}
                onChange={(e) =>
                  setInputData({ ...inputData, pinCode: e.target.value })
                }
              />

              <TextInput
                label="State"
                disabled={loading}
                required
                placeholder="Delhi"
                type="text"
                value={inputData.state}
                onChange={(e) =>
                  setInputData({ ...inputData, state: e.target.value })
                }
              />
            </div>

            <div className="min-w-xs mt-4">
              <div>
                <span>Legal details</span>
              </div>

              <React.Fragment>
                <TextInput
                  label="Channel name"
                  required
                  type="text"
                  placeholder="Chai Aur Code"
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      youtubeChannelName: e.target.value,
                    })
                  }
                  value={inputData.youtubeChannelName}
                />
                <TextInput
                  label="Bank account number"
                  required
                  type="text"
                  placeholder="**************"
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      bankAccountNumber: e.target.value.trim().replace(" ", ""),
                    })
                  }
                  value={inputData.bankAccountNumber}
                />
                <TextInput
                  label="IFSC Code"
                  required
                  placeholder="**********"
                  type="text"
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      bankIfsc: e.target.value.trim().replace(" ", ""),
                    })
                  }
                  value={inputData.bankIfsc}
                />
                <TextInput
                  label="PanCard No."
                  required
                  placeholder="**********"
                  type="text"
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      panNumber: e.target.value.trim().replace(" ", ""),
                    })
                  }
                  value={inputData.panNumber}
                />
                <div className={"flex flex-col gap-y-2 mt-4"}>
                  <label
                    style={{
                      fontSize: "14px",
                    }}
                    className="font-medium dark:text-white"
                  >
                    Aadhar Card Document<span className="text-red-600">*</span>
                  </label>
                  <input
                    ref={documentInputRef}
                    accept="image/*"
                    type="file"
                    required
                    className={
                      "focus:outline-none p-2 w-full disabled:text-neutral-600 disabled:cursor-not-allowed text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm"
                    }
                  />
                </div>
              </React.Fragment>
            </div>
          </div>
          <div className="pt-10 text-center">
            <button
              disabled={
                loading ||
                inputData.phoneNumber.trim() == "" ||
                inputData.bankAccountNumber.trim() == "" ||
                inputData.bankIfsc.trim() == "" ||
                inputData.address.trim() == "" ||
                inputData.city.trim() == "" ||
                inputData.pinCode.trim() == "" ||
                inputData.state.trim() == ""
              }
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
