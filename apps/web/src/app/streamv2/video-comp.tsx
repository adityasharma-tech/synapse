import { Button } from "@/components/ui/btn";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    fetchPaymentPlanDetails,
    getStreamerSubscriptionDetail,
    startStreamerSubscription,
} from "@/lib/apiClient";
import { razorpayKeyId } from "@/lib/constants";
import { requestHandler } from "@/lib/requestHandler";
import { loadScript } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
// import { updateSubscriptionData } from "@/store/reducers/stream.reducer";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { LoaderCircle } from "lucide-react";
import React, { FormEvent, useCallback } from "react";
import { Link } from "react-router";

type VideoWindowComponentPropT = React.PropsWithChildren<{
    isChatOpen: boolean;
    setChatOpen: (_: boolean) => void;
}>;

export default function VideoWindowComponent({
    isChatOpen,
    setChatOpen,
}: VideoWindowComponentPropT) {
    const streamState = useAppSelector((state) => state.stream);

    return (
        <section className="h-full flex flex-col gap-y-3">
            <div className="bg-neutral-900 rounded-md pr-1 flex items-center justify-between h-9">
                <Link to="/">
                    <img
                        alt="Synapse"
                        src="/T&W@2x.png"
                        className="object-contain h-7"
                    />
                </Link>
                <div>
                    <button
                        onClick={() => setChatOpen(!isChatOpen)}
                        hidden={isChatOpen}
                        className="hover:bg-neutral-950 rotate-180 p-1.5 rounded md:cursor-pointer"
                    >
                        <svg
                            className="size-4.5 fill-neutral-50"
                            viewBox="0 0 16 16"
                            fill="none"
                        >
                            <g>
                                <path d="M7.774 5.263a.7.7 0 11.952-1.026l3.5 3.25a.7.7 0 010 1.026l-3.5 3.25a.7.7 0 01-.952-1.026L10.72 8 7.774 5.263z" />
                                <path
                                    fillRule="evenodd"
                                    d="M1 3.25A2.25 2.25 0 013.25 1h9.5A2.25 2.25 0 0115 3.25v9.5A2.25 2.25 0 0112.75 15h-9.5A2.25 2.25 0 011 12.75v-9.5zm2.25-.75a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h1.3v-11h-1.3zm9.5 11h-6.8v-11h6.8a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75z"
                                    clipRule="evenodd"
                                />
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
            {streamState.videoSource != "" ? (
                <iframe
                    src={`https://www.youtube.com/embed/${new URL(
                        streamState.videoSource
                    ).searchParams.get("v")}?&amp;autoplay=1&amp;mute=0`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="rounded-lg overflow-hidden w-full min-h-2/3 border border-neutral-900"
                ></iframe>
            ) : null}
            <div className="bg-neutral-900 rounded-md py-4 px-3 flex justify-between">
                <div className="flex items-center gap-x-2">
                    <img
                        className="size-10 rounded-full"
                        src={`https://placehold.co/400?id=${streamState.channel.channelName}`}
                    />
                    <div>
                        <div className="font-medium mb-1">
                            {streamState.channel.channelName}
                        </div>
                        <div className="text-xs text-neutral-300">
                            {streamState.streamTitle}
                        </div>
                    </div>
                    <div>
                        <SubscribeStreamerModel
                            details={{
                                streamerName: streamState.channel.channelName,
                                streamerId: streamState.channel.streamerId,
                            }}
                        />
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="flex gap-x-1 px-2">
                        <svg className="size-5" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M5 21a7 7 0 1114 0M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                                className="stroke-2 stroke-rose-600"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="text-rose-600">
                            {streamState.viewerCount}
                        </span>
                    </div>
                    <div className="px-3">
                        <button className="hover:bg-neutral-950 p-1.5 bg-neutral-950/80 rounded md:cursor-pointer">
                            <svg
                                className="size-4.5 stroke-neutral-50 stroke-1"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M20 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m12-5l-4-4m0 0L8 8m4-4v12"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SubscribeStreamerModel({
    details,
}: React.PropsWithChildren<{
    details: any;
}>) {
    const [loading, setLoading] = React.useState(false);
    const [fetching, setFetching] = React.useState(false);
    const [subscriptionDetailsLoading, setSubscriptionDetailsLoading] =
        React.useState(true);
    const [isModelOpen, setModelOpen] = React.useState(false);
    const [planDetails, setPlanDetails] = React.useState<{
        planName: string;
        inrAmountPerMonth: number;
        planDetails: string;
    } | null>(null);

    const user = useAppSelector((state) => state.app.user);
    const subscriptionDetails = useAppSelector(
        (state) => state.stream.subscription
    );
    const dispatch = useAppDispatch();

    const handleRazorpaySubscriptionCheckout = useCallback(
        (props: { subscriptionId: string }) => {
            setModelOpen(false);
            const options = {
                key: razorpayKeyId,
                subscription_id: props.subscriptionId,
                name: user?.firstName + " " + user?.lastName,
                description: "subscription for streamer",
                prefill: {
                    name: user?.firstName + " " + user?.lastName,
                    email: user?.email,
                },
            };

            // @ts-ignore
            const rzpay = new window.Razorpay(options);
            rzpay.open();
        },
        [user, setModelOpen, window]
    );

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            await requestHandler(
                startStreamerSubscription({ streamerId: details.streamerId }),
                setLoading,
                (data) => {
                    if (!data.success) return;

                    handleRazorpaySubscriptionCheckout({
                        subscriptionId: data.data.razorpaySubscriptionId,
                    });
                },
                undefined,
                undefined
            );
        },
        [requestHandler, startStreamerSubscription, details, setLoading]
    );

    const handleRequestPlanDetails = useCallback(async () => {
        if (details.streamerId != 0)
            await requestHandler(
                fetchPaymentPlanDetails({ streamerId: details.streamerId }),
                setFetching,
                (data) => {
                    setPlanDetails({
                        inrAmountPerMonth: data.data.plan.planAmount,
                        planDetails: data.data.plan.planDetails,
                        planName: data.data.plan.planName,
                    });
                },
                undefined,
                false
            );
    }, [
        requestHandler,
        fetchPaymentPlanDetails,
        setFetching,
        setPlanDetails,
        details,
    ]);

    const handleGetUserSubscriptionDetails = useCallback(async () => {
        if (details.streamerId != 0)
            await requestHandler(
                getStreamerSubscriptionDetail({
                    streamerId: details.streamerId,
                }),
                setSubscriptionDetailsLoading,
                async (data) => {
                    if (data.data.subsciption.status != "active")
                        await handleRequestPlanDetails();
                    // dispatch(
                    //     updateSubscriptionData({
                    //         status: data.data.subsciption.status,
                    //         streamerId: data.data.subsciption.streamerId,
                    //         subscriptionId:
                    //             data.data.subsciption.subscriptionId,
                    //     })
                    // );
                    // TOFIX: here
                },
                async () => {
                    await handleRequestPlanDetails();
                },
                false
            );
    }, [
        details,
        requestHandler,
        getStreamerSubscriptionDetail,
        setSubscriptionDetailsLoading,
        handleRequestPlanDetails,
        dispatch,
        // updateSubscriptionData,
    ]);

    React.useEffect(() => {
        handleGetUserSubscriptionDetails();
    }, [details.streamerId]);

    React.useEffect(() => {
        loadScript("https://checkout.razorpay.com/v1/checkout.js").catch(
            (err) => {
                console.error(`Failed to load razorpay api.`, err);
            }
        );
    }, [loadScript]);

    return (subscriptionDetails?.status == "active" ||
        subscriptionDetails?.status == "authenticated") &&
        subscriptionDetails.subscriptionId ? (
        <div className="uppercase font-medium bg-neutral-100 px-1.5 py-0.5 rounded mx-3 active:ring-3 text-sm text-neutral-800 ring-rose-800/30">
            subscribed
        </div>
    ) : (
        <Dialog open={isModelOpen} onOpenChange={setModelOpen}>
            <DialogTrigger>
                {subscriptionDetailsLoading ? (
                    <Skeleton className="px-14 h-7 mx-5" />
                ) : (
                    <div className="uppercase font-medium bg-rose-700 px-1.5 py-0.5 rounded mx-3 md:cursor-pointer active:ring-3 text-sm ring-rose-800/30">
                        subscribe
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="overflow-y-visible max-w-xl p-0">
                {fetching || !planDetails ? (
                    <div className="px-5 py-5">
                        <div className="flex flex-col space-y-3">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                            <Skeleton className="h-[125px] w-full rounded-xl" />
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-0 [&>button:last-child]:top-3.5"
                    >
                        <DialogHeader className="contents space-y-0 text-left">
                            <DialogTitle className="border-b px-6 py-4 text-base">
                                Subscribe to {planDetails.planName}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="h-full flex flex-col gap-y-2 p-5">
                            <div className="flex gap-x-1 items-start">
                                <img
                                    className="size-10 rounded-full"
                                    src={`https://placehold.co/400?id={props.username}`}
                                />
                                <div className="flex flex-col px-3">
                                    <span className="text-emerald-500 font-semibold">
                                        Subscription by {details.streamerName}
                                    </span>
                                    <div className="text-sm">
                                        Monthly recurring charge, starting{" "}
                                        {new Date().toLocaleDateString(
                                            "en-US",
                                            {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            }
                                        )}
                                        . Cancel anytime from Subscription page.
                                    </div>
                                </div>
                            </div>
                            <div className="border-t mt-3" />
                            <div className="py-3">
                                <div className="flex justify-end text-xl text-neutral-200 font-semibold gap-x-10">
                                    <span>Total including GST:</span>
                                    <span>
                                        ₹{planDetails.inrAmountPerMonth}
                                        <span className="text-base">
                                            /month
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="border-t px-6 py-4">
                            <Button disabled={loading} type="submit">
                                <LoaderCircle
                                    aria-hidden={!loading}
                                    className="animate-spin aria-hidden:hidden"
                                />
                                {subscriptionDetails?.status == "created"
                                    ? "Pay now"
                                    : "Review Purchase"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
