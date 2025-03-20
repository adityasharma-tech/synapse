import React, { FormEventHandler, useCallback, useState } from "react";
import Header from "../../../components/header";
import { useSocket } from "../../../hooks/socket.hook";
import { SocketEventEnum } from "../../../lib/constants";
import { getStreamById } from "../../../lib/apiClient";
import { useParams } from "react-router";
import { requestHandler } from "../../../lib/requestHandler";
import LoadingComp from "../../../components/loading";

export default function DashStream() {
  const [streamRunning, setStreamRunning] = useState(false);
  const [_, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { streamId } = useParams();
  const { socket } = useSocket();

  const [message, setMessage] = useState("");

  const getStreamData = useCallback(async () => {
    if(!streamId) return;
    const st = await requestHandler(getStreamById({ streamId }), setLoading);
    setStream(st);
  }, [requestHandler, getStreamById, setLoading, setStream, streamId]);

  const startStream = useCallback(() => {
    if (!socket||!streamId) return;
    console.log(streamId);
    setStreamRunning(true);
    socket.emit(SocketEventEnum.JOIN_STREAM_EVENT, streamId.trim());
    socket.on(SocketEventEnum.CHAT_CREATE_EVENT, (chatObject, roomId) => {
      console.log(chatObject, roomId);
    });
  }, [socket, streamId, SocketEventEnum, setStreamRunning]);

  const handleSendMessage: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      socket?.emit(SocketEventEnum.CHAT_CREATE_EVENT, {
        
      }, streamId);
    },
    [socket, SocketEventEnum.CHAT_CREATE_EVENT, message]
  );

  React.useEffect(() => {
    getStreamData();
  }, []);

  React.useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.SOCKET_ERROR_EVENT, (error) => {
      console.error(`Error from socket server: `, error);
    });
  }, [socket]);

  if (loading) return <LoadingComp />;
  return (
    <React.Fragment>
      <Header>
        {streamRunning ? (
          <button className="btn btn-soft btn-error px-20">Exit stream</button>
        ) : (
          <button
            onClick={startStream}
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
            <PaymentChatComp />
            <ChatComp />
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

function ChatComp() {
  return (
    <div className="p-3 bg-neutral-800 mt-2 rounded-lg">
      <div className="flex justify-between">
        <div className="flex gap-x-3 items-center">
          <div>
            <img
              src="https://placehold.co/34"
              className="rounded-full size-7"
            />
          </div>
          <span className="font-medium">Aditya Sharma</span>
        </div>
        <button className="btn btn-soft btn-success btn-sm">Done</button>
      </div>
      <div className="divider my-1.5" />
      <div className="font-medium">
        Could you clarify what you mean by "simple messages"? Do you need short
        message examples, code for sending messages, or something else?
      </div>
    </div>
  );
}

function PaymentChatComp() {
  return (
    <div className="p-3 bg-rose-800 mt-2 rounded-lg">
      <div className="flex justify-between">
        <div className="flex gap-x-3 items-center">
          <div>
            <img
              src="https://placehold.co/34"
              className="rounded-full size-7"
            />
          </div>
          <span className="font-medium">Aditya Sharma</span>
        </div>
        <div className="flex gap-x-4 items-center">
          <span className="font-semibold text-lg">200$</span>
          <button className="btn btn-soft btn-success btn-sm">Done</button>
        </div>
      </div>
      <div className="divider my-1.5" />
      <div className="flex gap-x-3">
        <div className="font-medium">
          Could you clarify what you mean by "simple messages"? Do you need
          short message examples, code for sending messages, or something else?
        </div>
        <div>
          <button className="btn btn-ghost btn-sm">
            <svg
              width="15px"
              height="15px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.1835 7.80516L16.2188 4.83755C14.1921 2.8089 13.1788 1.79457 12.0904 2.03468C11.0021 2.2748 10.5086 3.62155 9.5217 6.31506L8.85373 8.1381C8.59063 8.85617 8.45908 9.2152 8.22239 9.49292C8.11619 9.61754 7.99536 9.72887 7.86251 9.82451C7.56644 10.0377 7.19811 10.1392 6.46145 10.3423C4.80107 10.8 3.97088 11.0289 3.65804 11.5721C3.5228 11.8069 3.45242 12.0735 3.45413 12.3446C3.45809 12.9715 4.06698 13.581 5.28476 14.8L6.69935 16.2163L2.22345 20.6964C1.92552 20.9946 1.92552 21.4782 2.22345 21.7764C2.52138 22.0746 3.00443 22.0746 3.30236 21.7764L7.77841 17.2961L9.24441 18.7635C10.4699 19.9902 11.0827 20.6036 11.7134 20.6045C11.9792 20.6049 12.2404 20.5358 12.4713 20.4041C13.0192 20.0914 13.2493 19.2551 13.7095 17.5825C13.9119 16.8472 14.013 16.4795 14.2254 16.1835C14.3184 16.054 14.4262 15.9358 14.5468 15.8314C14.8221 15.593 15.1788 15.459 15.8922 15.191L17.7362 14.4981C20.4 13.4973 21.7319 12.9969 21.9667 11.9115C22.2014 10.826 21.1954 9.81905 19.1835 7.80516Z"
                fill="#fefefe"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
