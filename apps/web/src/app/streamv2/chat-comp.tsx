import LoadingComp from "@/components/loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MessageSquareMoreIcon, X } from "lucide-react";
import React, {
    FormEventHandler,
    useCallback,
    useId,
    useRef,
    useState,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { BasicChatComp } from "../stream";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

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
    const user = useAppSelector((state) => state.app.user);

    const paymentAmountInputId = useId();

    // special state for basic message type
    // const [optimisticMessages, setOptimisticMessages] = useOptimistic(streamState.basicChats)

    // local states
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [__, setPayDialogOpen] = useState(false);
    const [superchatEnabled, setSuperchatEnabled] = useState(false);
    const [replyMessage, setReplyMessage] = useState<{
        messageId: string | null;
        message: string | null;
        username: string | null;
    }>({
        messageId: null,
        message: null,
        username: null,
    });
    const [superchatAmount, setSuperchatAmount] = useState(20);

    const [paymentSessionId, setPaymentSessionId] = useState<string | null>(
        null
    );

    // cashfree states
    const [cashfree] = useState<any>(null);

    // refs
    const lastMessageRef = useRef<HTMLDivElement | null>(null);

    // send message by admin TODO: handle permission on server side, check if he is admin or not and add a check mark and highlight
    const handleSendMessage: FormEventHandler<HTMLFormElement> = useCallback(
        async (e) => {
            e.preventDefault();
            if (superchatEnabled) return await handleMakePayment();

            if (socket && message.trim() != "")
                socket.emit(SocketEventEnum.CHAT_CREATE_EVENT, {
                    message,
                    streamId,
                    replyMessageId: replyMessage.messageId ?? undefined,
                    replyMessage: replyMessage.message ?? undefined,
                    replyUsername: replyMessage.username ?? undefined,
                });
            setMessage("");
            setReplyMessage({ message: null, messageId: null, username: null });
        },
        [
            superchatEnabled,
            socket,
            SocketEventEnum,
            message,
            streamId,
            setMessage,
            replyMessage,
            setReplyMessage,
        ]
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
    const handleMakePayment = useCallback(async () => {
        if (!streamId) return;

        if (superchatAmount < 1)
            return toast.error("Superchat minimum payment amount is ₹1.");

        await requestHandler(
            createPremiumChatOrder({
                message,
                streamId: streamId,
                paymentAmount: superchatAmount,
            }),
            setPaymentLoading,
            async (data) => {
                const orderId = data.data.orderId;
                await handleRazorpayPayment(orderId);
            },
            undefined,
            false
        );
        setMessage("");
        setSuperchatEnabled(false);
    }, [
        streamId,
        requestHandler,
        createPremiumChatOrder,
        setSuperchatEnabled,
        message,
        superchatAmount,
        setPaymentLoading,
        setMessage,
        setPaymentSessionId,
        toast.error,
        handleCheckout,
    ]);

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
                                    streamerId: result.data.stream.streamerId,
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
                            `http://localhost:5173/stream/${streamId}/chat?popout=true`,
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

            <div className="relative border flex flex-col overflow-y-auto gap-y-0.5 fill-indigo-600 border-neutral-900 flex-1 rounded-md">
                {streamState.basicChats.map((chat) => (
                    <ChatComponent
                        id={chat.id}
                        markRead={chat.markRead}
                        key={chat.id}
                        myMessage={
                            user?.username
                                ? user.username == chat.user.username
                                : false
                        }
                        superchatAmount={chat.paymentAmount}
                        message={chat.message}
                        profileColor="oklch(76.9% 0.188 70.08)"
                        username={chat.user.username}
                        upvotes={chat.upVotes}
                        downvotes={chat.downVotes}
                        reply={chat.reply}
                        handleDownVoteChat={() => handleDownVoteChat(chat.id)}
                        handleMarkDone={() => handleUpdateMarkDone(chat.id)}
                        handleUpVoteChat={() => handleUpVoteChat(chat.id)}
                        handleReply={() =>
                            setReplyMessage({
                                message: chat.message,
                                messageId: chat.id,
                                username: chat.user.username,
                            })
                        }
                    />
                ))}
                {streamState.basicChats.length <= 0 && (
                    <span className="absolute top-1/2 right-1/2 translate-1/2 text-sm text-neutral-600">
                        No messages yet
                    </span>
                )}
                <div ref={lastMessageRef}></div>
                <div
                    aria-hidden={!superchatEnabled}
                    className="sticky aria-hidden:hidden bottom-2 mt-auto left-2 max-w-xs"
                >
                    <div className="mx-auto flex h-full w-full items-center justify-center">
                        <div className="w-full rounded-md bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-px">
                            <div className="flex justify-between flex-col bg-neutral-950/90 h-full w-full rounded-md p-2 ">
                                <div className="*:not-first:mt-2">
                                    <Label htmlFor={paymentAmountInputId}>
                                        Superchat
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            required
                                            id={paymentAmountInputId}
                                            value={superchatAmount}
                                            onChange={(e) =>
                                                setSuperchatAmount(
                                                    +e.target.value
                                                )
                                            }
                                            className="peer ps-6 pe-12 border-0 border-b focus-visible:ring-0 text-md"
                                            placeholder="0.00"
                                            type="number"
                                        />
                                        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
                                            ₹
                                        </span>
                                        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
                                            INR
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-y-2 relative"
            >
                {replyMessage.messageId ? (
                    <div className="absolute bottom-20 px-3 py-3 bg-neutral-900 rounded right-0 left-0">
                        <button
                            type="button"
                            onClick={() =>
                                setReplyMessage({
                                    message: null,
                                    messageId: null,
                                    username: null,
                                })
                            }
                            className="hover:bg-neutral-950 absolute top-2 right-2 rounded md:cursor-pointer p-1 focus:outline-none"
                        >
                            <X className="size-5" />
                        </button>
                        <div className="flex gap-x-3">
                            <svg
                                className="size-6 stroke-white"
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
                            <span className="font-semibold text-neutral-500">
                                Replying to:
                            </span>
                        </div>
                        <div className="text-xs text-neutral-200 pt-3 flex items-center gap-x-2">
                            <div className="flex gap-x-1 items-center">
                                <img
                                    className="size-5 rounded-full"
                                    src={`https://avatar.iran.liara.run/public?id=${replyMessage.username}`}
                                />
                                <span className="text-sm truncate font-medium text-emerald-600">
                                    {replyMessage.username}
                                </span>
                            </div>
                            {replyMessage.message}
                        </div>
                    </div>
                ) : null}
                <div className="flex gap-x-1 items-center pr-1 focus-within:border-indigo-600 rounded border text-neutral-100 border-neutral-600 focus-within:ring-2 ring-indigo-700">
                    <input
                        required
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
                        onClick={() => setSuperchatEnabled((prev) => !prev)}
                        type="button"
                        aria-checked={superchatEnabled}
                        className="hover:bg-neutral-900 aria-checked:hover:bg-neutral-900 aria-checked:bg-neutral-800 p-1.5 rounded md:cursor-pointer"
                    >
                        <svg
                            className="size-4 fill-zinc-200"
                            viewBox="0 0 512 512"
                        >
                            <path d="M386.415 193.208h-98.934L359.434 0H161.566l-35.981 280.151h80.943L170.557 512z" />
                        </svg>
                    </button>

                    <Popover>
                        <PopoverTrigger asChild>
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
                        </PopoverTrigger>
                        <PopoverContent className="w-64 min-h-64 mr-2 mb-2 bg-neutral-900">
                            <div className="h-full grid"></div>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex justify-between">
                    <div>
                        {streamState.typerNames.length > 0 ? (
                            <div className="flex items-center gap-x-2 text-sm font-medium bg-black/10 px-3 rounded-t-md backdrop-blur-md left-0 right-0">
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
                    </div>
                    <div className="flex gap-x-2">
                        <button
                            disabled={paymentLoading}
                            className="font-medium bg-indigo-700 px-2 py-1 rounded md:cursor-pointer active:ring-3 ring-indigo-800/30"
                        >
                            Message
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}

interface ChatComponentPropT {
    id: string;
    message: string;
    profileColor: string;
    username: string;
    upvotes: number;
    downvotes: number;
    reply: {
        messageId: number | null;
        message: string | null;
        username: string | null;
    };
    myMessage: boolean;
    markRead: boolean;
    superchatAmount?: number;
    handleDownVoteChat: () => void;
    handleUpVoteChat: () => void;
    handleMarkDone: () => void;
    handleReply: () => void;
}

function ChatComponent(props: ChatComponentPropT) {
    if (props.superchatAmount && props.superchatAmount > 0) {
        return (
            <BasicChatComp
                paymentAmount={props.superchatAmount}
                handleDownVoteChat={props.handleDownVoteChat}
                handleUpVoteChat={props.handleUpVoteChat}
                createdAt={new Date()}
                downVotes={props.downvotes}
                handleMarkDone={props.handleMarkDone}
                id={props.id}
                markRead={props.markRead}
                message={props.message}
                pinned={false}
                upVotes={props.upvotes}
                updatedAt={new Date()}
                user={{ fullName: props.username }}
                orderId={"order"}
                reply={{} as any}
            />
        );
    }
    return (
        <div
            className={`relative group w-full px-2 py-1 hover:bg-neutral-900 ${props.myMessage ? "border-l-2 border-amber-400 bg-amber-300/5" : ""}`}
        >
            {props.reply.messageId ? (
                <div className="text-xs text-neutral-500 pb-1 flex gap-x-1 items-center">
                    <MessageSquareMoreIcon className="size-3 text-neutral-500" />
                    <span className="font-semibold">
                        {props.reply.username}:{" "}
                    </span>
                    <span className="truncate max-w-lg">
                        {props.reply.message}
                    </span>
                </div>
            ) : null}
            <div className={`flex items-center`}>
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
                        className={`ml-auto ${props.upvotes > props.downvotes ? "text-emerald-300" : "text-rose-600"} font-medium flex gap-x-1 text-sm items-center`}
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
                            className={`size-4.5 -mt-0.5 ${props.upvotes > props.downvotes ? "fill-emerald-300" : "fill-rose-600"}`}
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
                    <button
                        type="button"
                        onClick={props.handleReply}
                        className="hover:bg-neutral-900 rounded md:cursor-pointer p-1 focus:outline-none"
                    >
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
        </div>
    );
}
