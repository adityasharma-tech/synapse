import React from "react";
import Header from "../../components/header";
import LoadingComp from "../../components/loading";

import { useParams } from "react-router";
import { useSocket } from "../../hooks/socket.hook";
import { getStreamById } from "../../lib/apiClient";
import { requestHandler } from "../../lib/requestHandler";
import { SocketEventEnum } from "../../lib/constants";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  FormEventHandler,
  useCallback,
  useState,
  PropsWithChildren,
  useRef,
} from "react";
import {
  addBasicChat,
  addPremiumChat,
  BasicChatT,
  downVoteBasicChat,
  // PremiumChatT,
  removeBasicChat,
  updateStreamId,
  updateBasicChat,
  upVoteBasicChat,
  registerTypingEvent,
  removeTypingEvent,
  markDoneChat,
} from "../../store/reducers/stream.reducer";
import { setAllPreChats } from "../../store/actions/stream.actions";
import { useDebounce, useThrottle } from "../../lib/utils";

export default function Stream() {
  // hooks
  const { streamId } = useParams();
  const { socket } = useSocket();
  const dispatch = useAppDispatch();
  const throttle = useThrottle();
  const debounce = useDebounce();
  const user = useAppSelector((state) => state.app.user);

  // local states
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false); // TODO: need to update this one (remove)

  // state hooks
  const streamState = useAppSelector((state) => state.stream);

  // refs
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  // send message by admin TODO: handle permission on server side, check if he is admin or not and add a check mark and highlight
  const handleSendMessage: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      if (socket)
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
    [streamId, socket, SocketEventEnum.CHAT_MARK_DONE, dispatch, markDoneChat]
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

    // premium chat adder
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
    removeBasicChat,
    addPremiumChat,
    upVoteBasicChat,
    removeTypingEvent,
    downVoteBasicChat,
    lastMessageRef,
    registerTypingEvent,
  ]);

  const handleStartTyping = useCallback(() => {
    if (socket)
      socket.emit(SocketEventEnum.STREAM_TYPING_EVENT, {
        streamId: streamState.streamId,
      });
  }, [socket, SocketEventEnum, streamState.streamId]);

  const handleStopTyping = useCallback(() => {
    if (socket)
      socket.emit(SocketEventEnum.STREAM_STOP_TYPING_EVENT, {
        streamId: streamState.streamId,
      });
  }, [socket, SocketEventEnum, streamState.streamId]);

  React.useEffect(() => {
    if (streamId)
      (async () => {
        await requestHandler(getStreamById({ streamId }), setLoading);
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

  if (loading) return <LoadingComp />;
  return (
    <React.Fragment>
      <Header>
        <></>
      </Header>
      <div className="h-[calc(93vh-2px)] overflow-hidden flex p-2 gap-x-2">
        <div className="h-full w-[40%] bg-neutral-900 rounded-lg p-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative flex justify-center items-center min-h-36 bg-neutral-800 rounded-lg">
              <span className="absolute top-1 left-2 text-xs">
                Total Payment Recieved
              </span>
              <span className="text-4xl">500$</span>
            </div>
            <div className="relative flex justify-center items-center min-h-36 bg-neutral-800 rounded-lg">
              <span className="absolute top-1 left-2 text-xs">
                Total Payment Recieved
              </span>
              <span className="text-4xl">500$</span>
            </div>
          </div>
        </div>
        <div className="h-full w-[60%] bg-neutral-900 rounded-lg px-2 flex flex-col justify-between">
          <div className="overflow-y-auto scroll-smooth">
            {streamState.basicChats.map((chat, index) => (
              <ChatComp
                key={index}
                {...chat}
                role={user?.role ?? "viewer"}
                handleMarkDone={() => handleUpdateMarkDone(chat.id)}
                handleUpVoteChat={() => handleUpVoteChat(chat.id)}
                handleDownVoteChat={() => handleDownVoteChat(chat.id)}
              />
            ))}
            <div ref={lastMessageRef}></div>
          </div>
          <div>
            {streamState.typerNames.length > 0 ? (
              <div className="flex items-center gap-x-2 text-sm font-medium">
                <span className="loading loading-dots loading-lg" />
                {streamState.typerNames.map((user) => (
                  <span key={user.userId} className="animate-pulse">
                    {user.fullName}
                  </span>
                ))}
                <span>typing...</span>
              </div>
            ) : null}
            <form onSubmit={handleSendMessage} className="flex gap-x-4 py-2">
              <input
                onChange={(e) => {
                  setMessage(e.target.value);
                  throttle(handleStartTyping, 4000);
                  debounce(handleStopTyping, 3000);
                }}
                value={message}
                placeholder="Hello, World!"
                className="input input-primary w-full"
              />
              <button type="submit" className="btn btn-primary">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

interface BasicChatCompPropT extends BasicChatT {
  handleDownVoteChat: () => void;
  handleUpVoteChat: () => void;
  handleMarkDone: () => void;
  role?: "streamer" | "viewer";
}

function ChatComp(props: PropsWithChildren<BasicChatCompPropT>) {
  return (
    <div
      style={{
        opacity: props.markRead ? 0.5 : 1,
      }}
      className="p-3 bg-neutral-800 mt-2 rounded-lg"
    >
      <div className="flex justify-between">
        <div className="flex gap-x-3 items-center">
          <div>
            <img
              src={props.user.profilePicture ?? "https://placehold.co/34"}
              className="rounded-full size-7"
            />
          </div>
          <span className="text-neutral-50">{props.user.fullName}</span>
        </div>
        {props.role == "viewer" ? (
          <div className="flex gap-x-2">
            <button
              onClick={props.handleUpVoteChat}
              className="btn btn-success btn-outline btn-xs group transition-none"
            >
              <svg
                className="size-3 fill-emerald-500 group-hover:fill-neutral-800"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21,21H3L12,3Z" />
              </svg>
              <span>{props.upVotes}</span>
            </button>
            <button
              onClick={props.handleDownVoteChat}
              className="btn btn-warning btn-outline btn-xs group transition-none"
            >
              <svg
                className="rotate-180 size-3 fill-amber-400 group-hover:fill-neutral-800"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21,21H3L12,3Z" />
              </svg>
              <span>{props.downVotes}</span>
            </button>
          </div>
        ) : props.role == "streamer" ? (
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
      <div className="divider my-1.5" />
      <div className="font-medium text-neutral-100">{props.message}</div>
    </div>
  );
}

// function PaymentChatComp(props: PropsWithChildren<PremiumChatT>) {
//   return (
//     <div className="p-3 bg-rose-800 mt-2 rounded-lg">
//       <div className="flex justify-between">
//         <div className="flex gap-x-3 items-center">
//           <div>
//             <img
//               src={props.user.profilePicture ?? "https://placehold.co/34"}
//               className="rounded-full size-7"
//             />
//           </div>
//           <span className="font-medium">
//             {props.user.firstName} {props.user.lastName}
//           </span>
//         </div>
//         <div className="flex gap-x-4 items-center">
//           {/* Parse amount in a valid currecy before displaying */}
//           <span className="font-semibold text-lg">{props.amount}</span>
//           {props.markRead ? null : (
//             <button className="btn btn-soft btn-success btn-sm">Done</button>
//           )}
//         </div>
//       </div>
//       <div className="divider my-1.5" />
//       <div className="flex gap-x-3">
//         <div className="font-medium">{props.message}</div>
//         <div>
//           <button className="btn btn-ghost btn-sm">
//             <svg
//               width="15px"
//               height="15px"
//               viewBox="0 0 24 24"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M19.1835 7.80516L16.2188 4.83755C14.1921 2.8089 13.1788 1.79457 12.0904 2.03468C11.0021 2.2748 10.5086 3.62155 9.5217 6.31506L8.85373 8.1381C8.59063 8.85617 8.45908 9.2152 8.22239 9.49292C8.11619 9.61754 7.99536 9.72887 7.86251 9.82451C7.56644 10.0377 7.19811 10.1392 6.46145 10.3423C4.80107 10.8 3.97088 11.0289 3.65804 11.5721C3.5228 11.8069 3.45242 12.0735 3.45413 12.3446C3.45809 12.9715 4.06698 13.581 5.28476 14.8L6.69935 16.2163L2.22345 20.6964C1.92552 20.9946 1.92552 21.4782 2.22345 21.7764C2.52138 22.0746 3.00443 22.0746 3.30236 21.7764L7.77841 17.2961L9.24441 18.7635C10.4699 19.9902 11.0827 20.6036 11.7134 20.6045C11.9792 20.6049 12.2404 20.5358 12.4713 20.4041C13.0192 20.0914 13.2493 19.2551 13.7095 17.5825C13.9119 16.8472 14.013 16.4795 14.2254 16.1835C14.3184 16.054 14.4262 15.9358 14.5468 15.8314C14.8221 15.593 15.1788 15.459 15.8922 15.191L17.7362 14.4981C20.4 13.4973 21.7319 12.9969 21.9667 11.9115C22.2014 10.826 21.1954 9.81905 19.1835 7.80516Z"
//                 fill="#fefefe"
//               />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
