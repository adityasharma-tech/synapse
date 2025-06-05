import LoadingComp from "@/components/loading";
import { useSocket } from "@/hooks/socket.hook";
import { createPremiumChatOrder, getStreamById } from "@/lib/apiClient";
import { razorpayKeyId } from "@/lib/constants";
import { requestHandler } from "@/lib/requestHandler";
import { loadScript, useDebounce, useThrottle } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { setAllPreChats } from "@/store/actions/stream.actions";
import {
    addBasicChat,
    addPremiumChat,
    downVoteBasicChat,
    downVoteDownBasicChat,
    markDoneChat,
    registerTypingEvent,
    removeBasicChat,
    removeTypingEvent,
    updateBasicChat,
    updateMetadata,
    updateStreamId,
    updateUserRole,
    upVoteBasicChat,
    upVoteDownBasicChat,
} from "@/store/reducers/stream.reducer";
import { SocketEventEnum } from "@pkgs/lib/shared";
import React, { FormEventHandler, useCallback, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";

export default function ChatWindowComponent({
    toogleWindowOpen,
}: {
    toogleWindowOpen?: () => void;
}) {
    // state hooks
    const [searchParams] = useSearchParams();
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
    const [_, setPaymentLoading] = useState(false);
    const [__, setPayDialogOpen] = useState(false);
    const [premiumChatForm] = useState<{
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

    // send message by admin TODO: handle permission on server side, check if he is admin or not and add a check mark and highlight
    const handleSendMessage: FormEventHandler<HTMLFormElement> = useCallback(
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
            console.log(streamId);
            if (socket && streamId)
                socket.emit(SocketEventEnum.CHAT_UPVOTE_EVENT, {
                    streamId: streamId,
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
                    streamId: streamId,
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
            if (streamId)
                await requestHandler(
                    createPremiumChatOrder({
                        streamId: streamId,
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
            streamId,
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

        socket.on(SocketEventEnum.GET_STREAM_CONNECTIONS, (chatObject) => {
            dispatch(updateMetadata(chatObject));
        });

        // trigger when someone wants to remove hhis upvotes for a specific chat
        socket.on(SocketEventEnum.CHAT_UPVOTE_DOWN_EVENT, (chatObject) => {
            dispatch(upVoteDownBasicChat(chatObject));
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
                streamId: streamId,
            });
    }, [socket, SocketEventEnum, streamId]);

    //...
    const handleStopTyping = useCallback(() => {
        if (socket)
            socket.emit(SocketEventEnum.STREAM_STOP_TYPING_EVENT, {
                streamId: streamId,
            });
    }, [socket, SocketEventEnum, streamId]);

    React.useEffect(() => {
        if (streamId)
            (async () => {
                await requestHandler(
                    getStreamById({ streamId }),
                    setLoading,
                    (result) => {
                        dispatch(updateUserRole(result.data.userRole));
                        if (result.data.stream.youtubeVideoUrl)
                            dispatch(
                                updateMetadata({
                                    videoUrl:
                                        result.data.stream.youtubeVideoUrl,
                                    channelName:
                                        result.data.stream.streamerName,
                                    title: result.data.stream.streamTitle,
                                })
                            );
                    },
                    () => {
                        navigate("/dashboard");
                    },
                    false
                );
                dispatch(updateStreamId(streamId));
                dispatch(setAllPreChats({ streamId }));
            })();
    }, [streamId, updateStreamId, dispatch, setAllPreChats]);

    React.useEffect(() => {
        if (streamId) {
            if (socket && streamId && !streamState.streamRunning) {
                socket.emit(SocketEventEnum.JOIN_STREAM_EVENT, { streamId });
                handleRegisterSocketEvents();
                dispatch(updateMetadata({ streamRunning: true }));
            }
        }
    }, [streamId, socket, streamState.streamRunning]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (socket && streamId) {
                socket.emit(SocketEventEnum.GET_STREAM_CONNECTIONS, {
                    streamId,
                });
            }
        }, 10000);

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

    console.log(handleMakePayment);

    if (loading) return <LoadingComp />;

    return (
        <section
            data-popout={searchParams.get("popout") ? "true" : "false"}
            className="h-full data-[popout='true']:p-3 data-[popout='true']:bg-neutral-950 flex flex-col gap-y-3"
        >
            <div className="bg-neutral-900 rounded-md flex items-center h-9 justify-between px-1">
                <button
                    onClick={toogleWindowOpen}
                    hidden={searchParams.get("popout") ? true : false}
                    className="hover:bg-neutral-950 p-1.5 rounded md:cursor-pointer"
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
                <span className="text-sm font-medium text-center flex-1">
                    STREAM CHAT
                </span>
                <button
                    hidden={searchParams.get("popout") ? true : false}
                    onClick={() => {
                        window.open(
                            `http://localhost:5173/stream/b79bcbf9-147e-45ce-b2d2-3a6d374fb530/chat?popout=true`,
                            "StreamChat",
                            "popup=true"
                        );
                    }}
                    className="hover:bg-neutral-950 p-1.5 rounded md:cursor-pointer"
                >
                    <svg className="size-4.5" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M10 5H8.2c-1.12 0-1.68 0-2.108.218a1.999 1.999 0 00-.874.874C5 6.52 5 7.08 5 8.2v7.6c0 1.12 0 1.68.218 2.108a2 2 0 00.874.874c.427.218.987.218 2.105.218h7.606c1.118 0 1.677 0 2.104-.218.377-.192.683-.498.875-.874.218-.428.218-.987.218-2.105V14m1-5V4m0 0h-5m5 0l-7 7"
                            stroke="#fff"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            <div className="relative border flex flex-col overflow-y-auto gap-y-2 fill-indigo-600 border-neutral-900 flex-1 rounded-md ">
                {streamState.basicChats.map((chat) => (
                    <ChatComponent
                        key={chat.id}
                        message={chat.message}
                        profileColor="oklch(76.9% 0.188 70.08)"
                        username={chat.user.username}
                        upvotes={chat.upVotes}
                        downvotes={chat.downVotes}
                        handleDownVoteChat={() => handleDownVoteChat(chat.id)}
                        handleMarkDone={() => handleUpdateMarkDone(chat.id)}
                        handleUpVoteChat={() => handleUpVoteChat(chat.id)}
                    />
                ))}
                <div ref={lastMessageRef}></div>
            </div>
            <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-y-2"
            >
                <div className="flex gap-x-2 items-center pr-1 focus-within:border-indigo-600 rounded border text-neutral-100 border-neutral-600 focus-within:ring-2 ring-indigo-700">
                    <input
                        onChange={(e) => {
                            setMessage(e.target.value);
                            throttle(handleStartTyping, 4000);
                            debounce(handleStopTyping, 3000);
                        }}
                        value={message}
                        placeholder="Send a message"
                        className="py-1.5 px-2 outline-none flex-1"
                    />
                    <button
                        type="button"
                        className="hover:bg-neutral-800 rounded md:cursor-pointer"
                    >
                        <svg
                            className="size-7 stroke-zinc-200 stroke-1"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M9 14c.181.472.478.891.864 1.219a3.336 3.336 0 004.252.03c.39-.32.695-.735.884-1.205"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                clipRule="evenodd"
                                d="M19 12a7 7 0 11-14 0 7 7 0 0114 0z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M9 11v-1M13 10.174a1.093 1.093 0 002 0"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
                <div className="flex justify-between">
                    <div></div>
                    <button className="font-medium bg-indigo-700 px-2 py-1 rounded md:cursor-pointer active:ring-3 ring-indigo-800/30">
                        Message
                    </button>
                </div>
            </form>
        </section>
    );
}

interface ChatComponentPropT {
    message: string;
    profileColor: string;
    username: string;
    upvotes: number;
    downvotes: number;
    handleDownVoteChat: () => void;
    handleUpVoteChat: () => void;
    handleMarkDone: () => void;
}

function ChatComponent(props: ChatComponentPropT) {
    return (
        <div className="relative group flex w-full px-2 py-1 items-center hover:bg-neutral-900">
            <div className="flex gap-x-1 items-center">
                <img
                    className="size-5 rounded-full"
                    src={`https://avatar.iran.liara.run/public?id=${props.username}`}
                />
                <span
                    style={{
                        color: props.profileColor,
                    }}
                    className="text-sm truncate font-medium"
                >
                    {props.username}
                </span>
            </div>
            <div>
                <p className="text-neutral-200 text-sm flex-1 px-2">
                    {props.message}
                </p>
            </div>
            {props.upvotes != props.downvotes ? (
                <div
                    className={`ml-auto p-1 ${props.upvotes > props.downvotes ? "text-emerald-300" : "text-rose-600"} font-medium flex gap-x-1 text-sm items-center`}
                >
                    <span>
                        {props.upvotes > props.downvotes
                            ? props.upvotes - props.downvotes
                            : props.downvotes - props.upvotes}
                    </span>
                    <svg
                        style={{
                            rotate:
                                props.upvotes < props.downvotes
                                    ? "180deg"
                                    : undefined,
                        }}
                        className={`size-4 -mt-0.5 ${props.upvotes > props.downvotes ? "fill-emerald-300" : "fill-rose-600"}`}
                        viewBox="0 0 24 24"
                    >
                        <path d="M4 14h4v7a1 1 0 001 1h6a1 1 0 001-1v-7h4a1.001 1.001 0 00.781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 004 14z" />
                    </svg>
                </div>
            ) : null}
            <div className="absolute z-20 -bottom-4 opacity-80 hover:opacity-100 group-hover:flex hidden bg-neutral-800 border border-neutral-800 right-16 rounded">
                <button
                    onClick={props.handleUpVoteChat}
                    className="hover:bg-neutral-900 rounded md:cursor-pointer p-1 focus:outline-none"
                >
                    <svg className="size-5" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M7.24 11v9H5.63c-.9 0-1.62-.72-1.62-1.61v-5.77c0-.89.73-1.62 1.62-1.62h1.61zM18.5 9.5h-4.78V6c0-1.1-.9-2-1.99-2h-.09c-.4 0-.76.24-.92.61L7.99 11v9h9.2c.73 0 1.35-.52 1.48-1.24l1.32-7.5c.16-.92-.54-1.76-1.48-1.76h-.01z"
                            className="fill-neutral-400"
                        />
                    </svg>
                </button>
                <button
                    onClick={props.handleDownVoteChat}
                    className="hover:bg-neutral-900 rounded md:cursor-pointer p-1 focus:outline-none"
                >
                    <svg
                        className="size-4.5 rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M7.24 11v9H5.63c-.9 0-1.62-.72-1.62-1.61v-5.77c0-.89.73-1.62 1.62-1.62h1.61zM18.5 9.5h-4.78V6c0-1.1-.9-2-1.99-2h-.09c-.4 0-.76.24-.92.61L7.99 11v9h9.2c.73 0 1.35-.52 1.48-1.24l1.32-7.5c.16-.92-.54-1.76-1.48-1.76h-.01z"
                            className="fill-neutral-400"
                        />
                    </svg>
                </button>
                <button className="hover:bg-neutral-900 rounded md:cursor-pointer p-1 focus:outline-none">
                    <svg
                        className="size-4.5 stroke-white"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M20 17v-1.2c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C17.72 11 16.88 11 15.2 11H4m0 0l4-4m-4 4l4 4"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
