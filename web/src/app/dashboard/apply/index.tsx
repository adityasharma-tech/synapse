import React from "react";
import TextArea from "../../../components/cui/TextArea";
import TextInput from "../../../components/cui/TextInput";

import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../store";
import { requestHandler } from "../../../lib/requestHandler";
import { applyForStreamer } from "../../../lib/apiClient";
import { FormEventHandler, useCallback, useState } from "react";
import { loadScript } from "../../../lib/utils";
import { msgAuthToken, msgWidgetId } from "../../../lib/constants";

export default function ApplyForStreamer() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const user = useAppSelector((state) => state.app.user);

  const [formData, setFormData] = useState<{
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
  });

  const handleStreamer: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if(!formData.phoneNumber.includes('+')) return toast('Please include country code with phone number');
      setLoading(true);
      const configuration = {
        widgetId: msgWidgetId,
        tokenAuth: msgAuthToken,
        identifier: formData.phoneNumber,
        exposeMethods: "false", // When true will expose the methods for OTP verification. Refer 'How it works?' for more details
        success: async (data: any) => {
          // get verified token in response
          await requestHandler(
            applyForStreamer({
              bankAccountNumber: formData.bankAccountNumber,
              bankIfsc: formData.bankIfsc,
              city: formData.city,
              phoneNumber: formData.phoneNumber,
              postalCode: formData.pinCode,
              state: formData.state,
              streetAddress: formData.address,
              youtubeChannelName: formData.youtubeChannelName,
              authToken: data.message,
            }),
            setLoading,
            ()=>{
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
      formData,
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
                value={formData.phoneNumber}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    phoneNumber: e.target.value.trim().replace(" ", ""),
                  });
                }}
              />
              <TextArea
                required
                label="Address"
                disabled={loading}
                placeholder="Address here"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />

              <TextInput
                label="City"
                disabled={loading}
                required
                placeholder="New york"
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />

              <TextInput
                label="Pincode"
                disabled={loading}
                required
                placeholder="123456"
                type="tel"
                value={formData.pinCode}
                onChange={(e) =>
                  setFormData({ ...formData, pinCode: e.target.value })
                }
              />

              <TextInput
                label="State"
                disabled={loading}
                required
                placeholder="Delhi"
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
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
                    setFormData({
                      ...formData,
                      youtubeChannelName: e.target.value,
                    })
                  }
                  value={formData.youtubeChannelName}
                />
                <TextInput
                  label="Bank account number"
                  required
                  type="text"
                  placeholder="**************"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankAccountNumber: e.target.value.trim().replace(" ", ""),
                    })
                  }
                  value={formData.bankAccountNumber}
                />
                <TextInput
                  label="IFSC Code"
                  required
                  placeholder="**********"
                  type="text"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankIfsc: e.target.value.trim().replace(" ", ""),
                    })
                  }
                  value={formData.bankIfsc}
                />
              </React.Fragment>
            </div>
          </div>
          <div className="pt-10 text-center">
            <button
              disabled={
                loading ||
                formData.phoneNumber.trim() == "" ||
                formData.bankAccountNumber.trim() == "" ||
                formData.bankIfsc.trim() == "" ||
                formData.address.trim() == "" ||
                formData.city.trim() == "" ||
                formData.pinCode.trim() == "" ||
                formData.state.trim() == ""
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
