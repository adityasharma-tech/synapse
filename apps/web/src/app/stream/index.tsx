import React, { MouseEventHandler } from "react";
import LoadingComp from "../../components/loading";

import { useNavigate, useParams } from "react-router";
import { useSocket } from "../../hooks/socket.hook";
import { createPremiumChatOrder, getStreamById } from "../../lib/apiClient";
import { requestHandler } from "../../lib/requestHandler";
import { razorpayKeyId } from "../../lib/constants";
import { SocketEventEnum } from "@pkgs/lib/shared";
import { useAppDispatch, useAppSelector } from "../../store";
import {
    useRef,
    useState,
    useCallback,
    FormEventHandler,
    PropsWithChildren,
} from "react";
import {
    addBasicChat,
    addPremiumChat,
    downVoteBasicChat,
    removeBasicChat,
    updateStreamId,
    updateBasicChat,
    upVoteBasicChat,
    registerTypingEvent,
    removeTypingEvent,
    markDoneChat,
    upVoteDownBasicChat,
    downVoteDownBasicChat,
    PremiumChatT,
    updateUserRole,
    updateMetadata,
} from "../../store/reducers/stream.reducer";
import { setAllPreChats } from "../../store/actions/stream.actions";
import { loadScript, useDebounce, useThrottle } from "../../lib/utils";
import { toast } from "sonner";

export default function Stream() {
    // hooks
    const { streamId } = useParams();
    const { socket } = useSocket();
    const dispatch = useAppDispatch();
    const throttle = useThrottle();
    const debounce = useDebounce();
    const navigate = useNavigate();
    // state hooks
    const streamState = useAppSelector((state) => state.stream);

    // special state for basic message type
    // const [optimisticMessages, setOptimisticMessages] = useOptimistic(streamState.basicChats)

    // local states
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [paymentLoding, setPaymentLoading] = useState(false);
    const [streaming, setStreaming] = useState(false); // TODO: need to update this one (remove)
    const [videoUrl, setVideoUrl] = useState("");

    const [dialogPayOpen, setPayDialogOpen] = useState(false);
    const [premiumChatForm, setPremiumChatForm] = useState<{
        paymentAmount: number;
        message: string;
    }>({
        paymentAmount: 20,
        message: "Thank you!",
    });
    const [paymentSessionId, setPaymentSessionId] = useState<string | null>(
        null
    );

    // cashfree states
    const [cashfree] = useState<any>(null);

    // refs
    const lastMessageRef = useRef<HTMLDivElement | null>(null);
    const videoContainerRef = useRef<HTMLDivElement | null>(null);

    // send message by admin TODO: handle permission on server side, check if he is admin or not and add a check mark and highlight
    const handleSendMessage: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            e.preventDefault();
            if (socket && message.trim() != "")
                socket.emit(SocketEventEnum.CHAT_CREATE_EVENT, {
                    message,
                    streamId,
                });
            setMessage("");
        },
        [socket, SocketEventEnum, message, streamId, setMessage]
    );

    // need to remove this if role==="viewer"
    const handleUpVoteChat = useCallback(
        (messageId: string) => {
            if (socket && streamId)
                socket.emit(SocketEventEnum.CHAT_UPVOTE_EVENT, {
                    streamId: streamState.streamId,
                    id: messageId,
                });
        },
        [socket, streamId, SocketEventEnum, streamState]
    );

    // need to remoe this if role==="streamer"
    const handleDownVoteChat = useCallback(
        (messageId: string) => {
            if (socket && streamId)
                socket.emit(SocketEventEnum.CHAT_DOWNVOTE_EVENT, {
                    streamId: streamState.streamId,
                    id: messageId,
                });
        },
        [socket, streamId, SocketEventEnum, streamState]
    );

    // send event to db to update the mark done of that specific chat
    const handleUpdateMarkDone = useCallback(
        (messageId: string) => {
            if (socket && streamId)
                socket.emit(SocketEventEnum.CHAT_MARK_DONE, {
                    streamId,
                    id: messageId,
                });
            dispatch(
                markDoneChat({
                    id: messageId,
                })
            );
        },
        [
            streamId,
            socket,
            SocketEventEnum.CHAT_MARK_DONE,
            dispatch,
            markDoneChat,
        ]
    );

    /**
   * Cashfree Payment handling
  
  const handleInitializeCashfree = useCallback(async () => {
    const lCashfree = await loadCashfree({
      mode: "sandbox",
    });
    setCashfree(lCashfree);
  }, [setCashfree, loadCashfree]);
  */

    /**
     * handling checkout
     */
    const handleCheckout = useCallback(
        async (paymentSessionId: string) => {
            if (!paymentSessionId || !cashfree)
                return toast("Session id not found.");
            let checkoutOptions = {
                paymentSessionId,
                redirectTarget: "_modal",
            };
            cashfree.checkout(checkoutOptions).then((result: any) => {
                if (result.error) {
                    // This will be true whenever user clicks on close icon inside the modal or any error happens during the payment
                    console.log(
                        "User has closed the popup or there is some payment error, Check for Payment Status"
                    );
                    console.log(result.error);
                    toast(result.error.message);
                }
                if (result.redirect) {
                    // This will be true when the payment redirection page couldnt be opened in the same window
                    // This is an exceptional case only when the page is opened inside an inAppBrowser
                    // In this case the customer will be redirected to return url once payment is completed
                    console.log("Payment will be redirected");
                }
                if (result.paymentDetails) {
                    // This will be called whenever the payment is completed irrespective of transaction status
                    console.log(
                        "Payment has been completed, Check for Payment Status"
                    );
                    toast(result.paymentDetails.paymentMessage);
                    setPayDialogOpen(false);
                }
            });
        },
        [cashfree, paymentSessionId, toast, setPayDialogOpen]
    );

    const handleRazorpayPayment = useCallback(async (orderId: string) => {
        const options = {
            key: razorpayKeyId,
            amount: 3000, // 30 rupay
            currency: "INR",
            name: "Acme Corp",
            description: "Test Transaction",
            image: "https://example.com/your_logo",
            order_id: orderId,
            prefill: {
                name: "Piyush Garg",
                email: "youremail@example.com",
                contact: "9999999999",
            },
            theme: {
                color: "#3399cc",
            },
        };

        // @ts-ignore
        const rzpay = new window.Razorpay(options);
        rzpay.open();
    }, []);

    // ...
    const handleMakePayment: FormEventHandler<HTMLFormElement> = useCallback(
        async (e) => {
            e.preventDefault();
            if (streamState.streamId)
                await requestHandler(
                    createPremiumChatOrder({
                        streamId: streamState.streamId,
                        ...premiumChatForm,
                    }),
                    setPaymentLoading,
                    async (data) => {
                        const orderId = data.data.orderId;
                        await handleRazorpayPayment(orderId);
                    }
                );
        },
        [
            streamState.streamId,
            requestHandler,
            createPremiumChatOrder,
            premiumChatForm,
            setPaymentLoading,
            setPaymentSessionId,
            toast,
            handleCheckout,
        ]
    );

    // handler to register all the socket events/listeners
    const handleRegisterSocketEvents = useCallback(() => {
        if (!socket) return console.error(`Socket not registered yet!`);

        // create new chats handler
        socket.on(SocketEventEnum.CHAT_CREATE_EVENT, (chatObject) =>
            dispatch(addBasicChat(chatObject))
        );

        // update chats handler
        socket.on(SocketEventEnum.CHAT_UPDATE_EVENT, (chatObject) =>
            dispatch(updateBasicChat(chatObject))
        );

        // delete basic chat handler
        socket.on(SocketEventEnum.CHAT_DELETE_EVENT, (chatObject) =>
            dispatch(removeBasicChat(chatObject))
        );

        // premium chat listener
        socket.on(SocketEventEnum.PAYMENT_CHAT_CREATE_EVENT, (chatObject) =>
            dispatch(addPremiumChat(chatObject))
        );

        // specific chat is upvoted
        socket.on(SocketEventEnum.CHAT_UPVOTE_EVENT, (chatObject) =>
            dispatch(upVoteBasicChat(chatObject))
        );

        // specific chat is down voted
        socket.on(SocketEventEnum.CHAT_DOWNVOTE_EVENT, (chatObject) =>
            dispatch(downVoteBasicChat(chatObject))
        );

        // if someone is typing listen events to them
        socket.on(SocketEventEnum.STREAM_TYPING_EVENT, (chatObject) => {
            dispatch(registerTypingEvent(chatObject));
        });

        // if someone stops typing listen events
        socket.on(SocketEventEnum.STREAM_STOP_TYPING_EVENT, (chatObject) => {
            dispatch(removeTypingEvent(chatObject));
        });

        // trigger when someone wants to remove hhis upvotes for a specific chat
        socket.on(SocketEventEnum.CHAT_UPVOTE_DOWN_EVENT, (chatObject) => {
            dispatch(upVoteDownBasicChat(chatObject));
        });

        socket.on(SocketEventEnum.GET_STREAM_CONNECTIONS, (chatObject) => {
            dispatch(updateMetadata(chatObject));
        });

        // trigger when someone wants to remove hhis downvotes for a specific chat
        socket.on(SocketEventEnum.CHAT_DOWNVOTE_DOWN_EVENT, (chatObject) => {
            dispatch(downVoteDownBasicChat(chatObject));
        });

        socket.onAny(() => {
            if (lastMessageRef.current)
                lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        });

        // error listener
        socket.on(SocketEventEnum.SOCKET_ERROR_EVENT, (error) => {
            console.error(`Error from socket server: `, error);
        });
    }, [
        socket,
        SocketEventEnum,
        dispatch,
        addBasicChat,
        updateBasicChat,
        updateMetadata,
        removeBasicChat,
        addPremiumChat,
        upVoteBasicChat,
        removeTypingEvent,
        downVoteBasicChat,
        lastMessageRef,
        upVoteDownBasicChat,
        downVoteDownBasicChat,
        registerTypingEvent,
    ]);

    //...
    const handleStartTyping = useCallback(() => {
        if (socket)
            socket.emit(SocketEventEnum.STREAM_TYPING_EVENT, {
                streamId: streamState.streamId,
            });
    }, [socket, SocketEventEnum, streamState.streamId]);

    //...
    const handleStopTyping = useCallback(() => {
        if (socket)
            socket.emit(SocketEventEnum.STREAM_STOP_TYPING_EVENT, {
                streamId: streamState.streamId,
            });
    }, [socket, SocketEventEnum, streamState.streamId]);

    React.useEffect(() => {
        if (streamId)
            (async () => {
                await requestHandler(
                    getStreamById({ streamId }),
                    setLoading,
                    (result) => {
                        dispatch(updateUserRole(result.data.userRole));
                        if (result.data.stream.youtubeVideoUrl)
                            setVideoUrl(result.data.stream.youtubeVideoUrl);
                    },
                    () => {
                        navigate("/dashboard");
                    },
                    false
                );
                dispatch(updateStreamId(streamId));
                dispatch(setAllPreChats({ streamId }));
            })();
    }, [streamId]);

    React.useEffect(() => {
        if (streamId) {
            if (socket && streamId && !streaming) {
                socket.emit(SocketEventEnum.JOIN_STREAM_EVENT, { streamId });
                handleRegisterSocketEvents();
                setStreaming(true);
            }
        }
    }, [streamId, socket, streaming]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (socket && streamId) {
                socket.emit(SocketEventEnum.GET_STREAM_CONNECTIONS, {
                    streamId,
                });
            }
        }, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [socket, streamId]);

    React.useEffect(() => {
        // handleInitializeCashfree();
        (async () => {
            const res = await loadScript(
                "https://checkout.razorpay.com/v1/checkout.js"
            );
            if (!res) alert("Failed to load razorpay api.");
        })();
    }, []);

    if (loading) return <LoadingComp />;

    return (
        <React.Fragment>
            {dialogPayOpen ? (
                <div className="fixed inset-0 z-5 flex justify-center items-center">
                    <span className="inset-0 absolute z-10 bg-black/50" />
                    <div className="relative z-20 bg-neutral-900 rounded-lg px-4 py-4 flex flex-col gap-y-3 min-h-46 min-w-md border border-neutral-800">
                        <div className="flex justify-between">
                            <span className="font-medium text-lg">
                                Make premium chat
                            </span>
                            <button
                                className="button btn-square btn-xs btn-soft"
                                type="button"
                                onClick={() => setPayDialogOpen(!dialogPayOpen)}
                            >
                                <svg
                                    className="size-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z"
                                        fill="#fefefe"
                                    />
                                </svg>
                            </button>
                        </div>
                        <form
                            onSubmit={handleMakePayment}
                            className="flex flex-col gap-4 "
                        >
                            <input
                                required
                                type="number"
                                className="input input-accent w-full"
                                placeholder="20 INR"
                                value={premiumChatForm.paymentAmount}
                                onChange={(e) =>
                                    setPremiumChatForm({
                                        ...premiumChatForm,
                                        paymentAmount: parseInt(e.target.value),
                                    })
                                }
                            />
                            <textarea
                                required
                                className="textarea textarea-info w-full"
                                placeholder="message here"
                                value={premiumChatForm.message}
                                onChange={(e) =>
                                    setPremiumChatForm({
                                        ...premiumChatForm,
                                        message: e.target.value,
                                    })
                                }
                            />
                            <button
                                type="submit"
                                className="button btn-soft btn-info ml-auto"
                            >
                                {paymentLoding ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : null}
                                Make payment
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}
            <header className="justify-between w-full flex py-5 px-6 items-center">
                <div>
                    <img className="h-8 w-auto dark:hidden" src="/T&B@2x.png" />
                    <img
                        className="h-8 w-auto not-dark:hidden"
                        src="/T&W@2x.png"
                    />
                </div>
                <div className="flex gap-x-3">
                    <div className="bg-[#222] rounded-lg py-1 text-sm flex items-center gap-x-3 px-3">
                        <span className="text-neutral-100">
                            {window.location.toString()}
                        </span>
                        <button
                            onClick={() => {
                                window.navigator.clipboard.writeText(
                                    window.location.toString()
                                );
                            }}
                            className="size-8 rounded-full bg-neutral-900 flex items-center justify-center cursor-pointer"
                        >
                            <svg
                                width="1.3em"
                                height="1.3em"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M21 8a3 3 0 00-3-3h-8a3 3 0 00-3 3v12a3 3 0 003 3h8a3 3 0 003-3V8zm-2 0a1 1 0 00-1-1h-8a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V8z"
                                    fill="#fefefe"
                                />
                                <path
                                    d="M6 3h10a1 1 0 100-2H6a3 3 0 00-3 3v14a1 1 0 102 0V4a1 1 0 011-1z"
                                    fill="#fefefe"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>
            <main className="grid grid-cols-2 w-full h-[calc(100vh-82px)] px-5">
                <div className="h-full">
                    <div
                        className="w-full min-h-[450px]"
                        ref={videoContainerRef}
                    >
                        {videoUrl && videoUrl.trim() != "" ? (
                            <iframe
                                width={
                                    videoContainerRef.current?.clientWidth
                                        ? videoContainerRef.current
                                              .clientWidth - 10
                                        : 500
                                }
                                height={videoContainerRef.current?.clientHeight}
                                src={`https://www.youtube.com/embed/${new URL(
                                    videoUrl
                                ).searchParams.get(
                                    "v"
                                )}?&amp;autoplay=1&amp;mute=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                className="rounded-lg overflow-hidden"
                            ></iframe>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-3 gap-3 p-4">
                        <div className="bg-neutral-950 rounded-lg py-4 flex items-center justify-between px-5">
                            <svg
                                height="1em"
                                width="1em"
                                id="prefix___x32_"
                                viewBox="0 0 512 512"
                                xmlSpace="preserve"
                            >
                                <style>{".prefix__st0{fill:#fff}"}</style>
                                <path
                                    className="prefix__st0"
                                    d="M458.159 404.216c-18.93-33.65-49.934-71.764-100.409-93.431-28.868 20.196-63.938 32.087-101.745 32.087-37.828 0-72.898-11.89-101.767-32.087-50.474 21.667-81.479 59.782-100.398 93.431C28.731 448.848 48.417 512 91.842 512h328.317c43.424 0 63.11-63.152 38-107.784zM256.005 300.641c74.144 0 134.231-60.108 134.231-134.242v-32.158C390.236 60.108 330.149 0 256.005 0 181.85 0 121.753 60.108 121.753 134.242V166.4c0 74.133 60.098 134.241 134.252 134.241z"
                                />
                            </svg>
                            {streamState.currentViewers} Watching
                        </div>
                        <div className="bg-neutral-950 rounded-lg py-4 flex items-center justify-between px-5">
                            {streamState.totalQuestions} Questions
                        </div>
                    </div>
                </div>
                <div className="h-[calc(100vh-210px)]">
                    <div className="h-full overflow-y-scroll">
                        {streamState.premiumChats.map((chat, idx) => (
                            <BasicChatComp
                                key={idx}
                                {...chat}
                                role={streamState.userRole}
                                handleMarkDone={() =>
                                    handleUpdateMarkDone(chat.id)
                                }
                                handleUpVoteChat={() =>
                                    handleUpVoteChat(chat.id)
                                }
                                handleDownVoteChat={() =>
                                    handleDownVoteChat(chat.id)
                                }
                            />
                        ))}
                        {streamState.basicChats.map((chat, idx) => (
                            <BasicChatComp
                                key={idx}
                                {...chat}
                                role={streamState.userRole}
                                handleMarkDone={() =>
                                    handleUpdateMarkDone(chat.id)
                                }
                                handleUpVoteChat={() =>
                                    handleUpVoteChat(chat.id)
                                }
                                handleDownVoteChat={() =>
                                    handleDownVoteChat(chat.id)
                                }
                            />
                        ))}
                        <div ref={lastMessageRef}></div>
                    </div>
                    <div className="relative">
                        {streamState.typerNames.length > 0 ? (
                            <div className="flex items-center gap-x-2 text-sm font-medium absolute -top-10 bg-black/10 px-3 rounded-t-md py-1 backdrop-blur-md left-0 right-0">
                                <span className="loading loading-dots loading-lg" />
                                {streamState.typerNames.map((user) => (
                                    <span
                                        key={user.userId}
                                        className="animate-pulse"
                                    >
                                        {user.fullName}
                                    </span>
                                ))}
                                <span>typing...</span>
                            </div>
                        ) : null}
                        <div className="w-full flex gap-x-2 px-4 py-4 bg-[#222] rounded-lg focus-within:border-neutral-200 border border-transparent">
                            <textarea
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    throttle(handleStartTyping, 4000);
                                    debounce(handleStopTyping, 3000);
                                }}
                                value={message}
                                placeholder="Enter message here..."
                                className="w-full focus:outline-none"
                            />
                            <div>
                                {streamState.userRole == "viewer" ? (
                                    <button
                                        onClick={() =>
                                            setPayDialogOpen(!dialogPayOpen)
                                        }
                                        className="button btn-outline"
                                    >
                                        Premium
                                    </button>
                                ) : null}

                                <button
                                    onClick={handleSendMessage}
                                    className="button btn-solid w-full justify-center mt-1"
                                >
                                    Basic
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </React.Fragment>
    );
}

interface BasicChatCompPropT extends PremiumChatT {
    handleDownVoteChat: () => void;
    handleUpVoteChat: () => void;
    handleMarkDone: () => void;
    role?: "streamer" | "viewer" | "admin";
}

export function BasicChatComp(props: PropsWithChildren<BasicChatCompPropT>) {
    return (
        <div
            data-premium={props.orderId ? true : false}
            data-markread={props.markRead}
            className="px-3 py-3 first:mt-0 mt-3 last:mb-10 bg-neutral-100 dark:bg-[#222] data-[markread=true]:opacity-60 rounded-xl data-[premium=true]:border data-[premium=true]:border-amber-300 data-[premium=true]:bg-amber-50 dark:data-[premium=true]:border-amber-300 dark:data-[premium=true]:bg-amber-300/5"
        >
            <div className="flex w-full justify-between">
                <div className="flex gap-x-3 items-center dark:text-neutral-50 text-neutral-800 font-medium">
                    <img
                        className="size-8 rounded-full"
                        src={`https://avatar.iran.liara.run/public?id=${props.user.username}`}
                    />
                    <span className="font-medium">{props.user.fullName}</span>
                    {props.paymentAmount ? (
                        <span className="font-semibold text-emerald-600">
                            ₹{Math.floor(props.paymentAmount / 100)}
                        </span>
                    ) : null}
                </div>
                {props.role == "viewer" ? (
                    props.orderId ? null : (
                        <React.Fragment>
                            <div className="flex gap-x-3 items-center">
                                <button
                                    onClick={props.handleUpVoteChat}
                                    className="button border text-sm pl-2 text-green-600 bg-green-50 active:ring-green-400 ring-transparent px-1 py-0.5 rounded-md border-green-600 ring"
                                >
                                    <span>{props.upVotes}</span>
                                    <svg
                                        width="1em"
                                        height="1em"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                    >
                                        <path
                                            d="M11.272 5.205l5 8A1.5 1.5 0 0115 15.5H5a1.5 1.5 0 01-1.272-2.295l5-8a1.5 1.5 0 012.544 0z"
                                            className="fill-green-600"
                                        />
                                    </svg>
                                </button>

                                <button
                                    onClick={props.handleDownVoteChat}
                                    className="button border text-sm pl-2 text-amber-600 bg-amber-50 active:ring-amber-400 ring-transparent px-1 py-0.5 rounded-md border-amber-600 ring"
                                >
                                    <span>{props.downVotes}</span>
                                    <svg
                                        width="1em"
                                        height="1em"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        className="rotate-180"
                                    >
                                        <path
                                            d="M11.272 5.205l5 8A1.5 1.5 0 0115 15.5H5a1.5 1.5 0 01-1.272-2.295l5-8a1.5 1.5 0 012.544 0z"
                                            className="fill-amber-600"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </React.Fragment>
                    )
                ) : props.role === "streamer" ? (
                    <div className="gap-x-2 flex items-center">
                        <span className="p-0.5 text-xs border border-green-500 rounded px-1.5">
                            {props.upVotes}
                        </span>
                        <span className="p-0.5 text-xs border border-amber-500 rounded px-1.5">
                            {props.downVotes}
                        </span>
                        <button
                            onClick={props.handleMarkDone}
                            className="btn btn-soft btn-success btn-xs"
                        >
                            Mark read
                        </button>
                    </div>
                ) : null}
            </div>
            <div className="pt-4">
                <span className="text-neutral-800 text-[15px] dark:text-neutral-50 antialiased">
                    {props.message}
                </span>
            </div>
        </div>
    );
}
