import React, { useState } from "react";
import Header from "../../components/header";
import TextInput from "../../components/cui/TextInput";

import { FormEventHandler, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useAppSelector } from "../../store";
import { getAllStreams, startNewStream } from "../../lib/apiClient";
import { requestHandler } from "../../lib/requestHandler";

export default function DashboardPage() {
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.app.user);

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [streams, setStreams] = useState<any[]>([]);

  const [streamLoading, setStreamLoading] = useState(false);

  const handleCreateStream: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      await requestHandler(
        startNewStream({
          title,
        }),
        setLoading,
        (res) => {
          navigate(`/stream/${res.data.stream.streamingUid}`);
        }
      );
    },
    [title, requestHandler, startNewStream, setLoading, navigate]
  );

  const handleFetchStreams = useCallback(async () => {
    await requestHandler(
      getAllStreams(),
      setStreamLoading,
      (result) => {
        setStreams(result.data.data);
      },
      undefined
    );
  }, [requestHandler, getAllStreams, setStreams]);

  React.useEffect(() => {
    handleFetchStreams();
  }, [user]);

  return (
    <React.Fragment>
      <Header>
        {user?.role == "streamer" ? (
          " "
        ) : user?.role == "viewer" ? (
          <Link to="/dashboard/apply">
            <button className="border cursor-pointer border-neutral-400 rounded-md px-5 py-2 capitalize font-medium">
              apply for streamer
            </button>
          </Link>
        ) : user?.role == "admin" ? (
          <Link to="/dashboard/streamer-applications">
            <button className="border cursor-pointer border-neutral-400 rounded-md px-5 py-2 capitalize font-medium">
              View applications
            </button>
          </Link>
        ) : null}
      </Header>
      <section className="h-[calc(100vh-72px)] flex flex-col">
        <div className="flex w-full gap-x-4 py-3 px-4 min-h-36">
          <div className="w-[45%]"></div>
          <form
            onSubmit={handleCreateStream}
            className="w-[55%] bg-neutral-900 rounded-md px-10 py-10 pb-28"
          >
            <div className="pb-4">
              <h1 className="text-xl font-medium">Create your chat stream</h1>
            </div>
            <div className="flex items-end gap-x-8">
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                contentClassName="w-full"
                required
                label="Title"
                placeholder="Streaming title"
              />
              <div className="mb-0.5">
                <button type="submit" className="btn btn-info text-nowrap">
                  <span
                    data-loading={loading ? "true" : "false"}
                    className="loading data-[loading='true']:block hidden loading-spinner loading-xs"
                  ></span>
                  Start new stream
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="h-full p-4">
          <div className="bg-neutral-900 h-full rounded-md p-4">
            <div className="text-lg font-medium">All previous streams</div>
            <div className="py-4 h-full overflow-y-scroll">
              {!streamLoading &&
                streams.map((stream, idx) => (
                  <div
                    tabIndex={0}
                    role="button"
                    onClick={() => navigate(`/stream/${stream.streamingUid}`)}
                    className="w-full cursor-pointer py-5 flex justify-between bg-neutral-950 mt-3 first:mt-0 rounded-lg px-6"
                    key={idx}
                  >
                    <div className="flex gap-x-4">
                      <span className="text-neutral-500">{idx}</span>
                      <span className="text-neutral-200">
                        {stream.streamTitle}
                      </span>
                    </div>
                    <div className="text-neutral-200">{stream.updatedAt}</div>
                  </div>
                ))}
              {streamLoading
                ? Array(5).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-full py-8 bg-neutral-800 animate-pulse mt-3 first:mt-0 rounded-lg px-6"
                    />
                  ))
                : null}
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}
