import React from "react";
import Header from "../../../components/header";
import LoadingComp from "../../../components/loading";

import { useParams } from "react-router";
import { useSocket } from "../../../hooks/socket.hook";
import { getStreamById } from "../../../lib/apiClient";
import { requestHandler } from "../../../lib/requestHandler";
import { SocketEventEnum } from "../../../lib/constants";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  FormEventHandler,
  useCallback,
  useState,
  PropsWithChildren,
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
  startStreaming,
  stopStreaming,
} from "../../../store/reducers/dash-stream.reducer";
import { setAllPreChats } from "../../../store/actions/stream.actions";

export default function DashStream() {
  // hooks
  const { streamId } = useParams();
  const { socket } = useSocket();
  const dispatch = useAppDispatch();

  // local states
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // state hooks
  const streamState = useAppSelector((state) => state.dashStream);

  // send message by admin
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

  // handle mark done
  const handleUpdateMarkDone = useCallback((messageId: string)=>{
    if(socket && streamId)
      socket.emit(SocketEventEnum.CHAT_MARK_DONE, { streamId, id: messageId })
  }, [streamId, socket, SocketEventEnum.CHAT_MARK_DONE])

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
    socket.on(SocketEventEnum.CHAT_UPVOTE_EVENT, (chatObject) =>
      dispatch(downVoteBasicChat(chatObject))
    );

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
    downVoteBasicChat,
  ]);

  // start receiving and sending messages to the roomId over sockets
  const handleStartStream = useCallback(() => {
    if (socket && streamState.streamId && !streamState.streamRunning) {
      socket.emit(SocketEventEnum.JOIN_STREAM_EVENT, {
        streamId: streamState.streamId,
      });
      dispatch(startStreaming());
      dispatch(setAllPreChats({ streamId: streamState.streamId }));
      handleRegisterSocketEvents();
    }
  }, [
    socket,
    dispatch,
    setAllPreChats,
    startStreaming,
    SocketEventEnum,
    streamState.streamId,
    streamState.streamRunning,
    handleRegisterSocketEvents,
  ]);

  // stop streaming and
  const handleStopStream = useCallback(() => {
    if (socket && streamState.streamId && streamState.streamRunning) {
      socket.emit(SocketEventEnum.LEAVE_STREAM_EVENT, streamState.streamId);
      dispatch(stopStreaming());
    }
  }, [
    socket,
    streamState.streamId,
    SocketEventEnum,
    streamState.streamRunning,
    dispatch,
    stopStreaming,
  ]);

  React.useEffect(() => {
    if (streamId)
      (async () => {
        await requestHandler(getStreamById({ streamId }), setLoading);
        dispatch(updateStreamId(streamId));
      })();
  }, [streamId]);

  if (loading) return <LoadingComp />;
  return (
    <React.Fragment>
      <Header>
        {streamState.streamRunning ? (
          <button
            onClick={handleStopStream}
            className="btn btn-soft btn-error px-20"
          >
            Exit stream
          </button>
        ) : (
          <button
            onClick={handleStartStream}
            className="btn btn-soft btn-success px-20"
          >
            Start stream
          </button>
        )}
      </Header>
      <div className="h-[calc(93vh-2px)] flex p-2 gap-x-2">
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
              <ChatComp handleMarkDone={()=>handleUpdateMarkDone(chat.id)} key={index} {...chat} />
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-x-4">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hello, World!"
              className="input input-primary w-full"
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
}

function ChatComp(props: PropsWithChildren<BasicChatT | any>) {
  return (
    <div className="p-3 bg-neutral-800 mt-2 rounded-lg">
      <div className="flex justify-between">
        <div className="flex gap-x-3 items-center">
          <div>
            <img
              src={props.user.profilePicture ?? "https://placehold.co/34"}
              className="rounded-full size-7"
            />
          </div>
          <span className="font-medium">{props.user.fullName}</span>
        </div>
        <div></div>
        <div className="gap-x-2 flex items-center">
          <span className="p-0.5 text-xs border border-green-500 rounded px-1.5">{props.upVotes}</span>
          <span className="p-0.5 text-xs border border-amber-500 rounded px-1.5">{props.downVotes}</span>
        <button className="btn btn-soft btn-success btn-xs">Mark read</button>
        </div>
      </div>
      <div className="divider my-1.5" />
      <div onClick={props.handleMarkDone} className="font-medium">{props.message}</div>
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
