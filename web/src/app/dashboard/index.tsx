import React, { useState } from "react";
import Header from "../../components/header";
import TextInput from "../../components/cui/TextInput";
import axiosInstance from "../../lib/axios";

import { useFetcher } from "../../hooks/fetcher.hook";
import { FormEventHandler, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useAppSelector } from "../../store";

export default function DashboardPage() {
  const { handleFetch, loading, serverRes } = useFetcher();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.app.user);

  const [title, setTitle] = useState("");

  const handleCreateStream: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      await handleFetch(
        axiosInstance.post(`/streams`, {
          title,
        })
      );
      if (serverRes.current?.success) {
        navigate(`stream/${serverRes.current.data.stream.streamingUid}`);
      }
    },
    [handleFetch, axiosInstance, serverRes.current, title]
  );

  const handleFetchStreams = useCallback(async()=>{
    await handleFetch(
      axiosInstance.get(`/streams`)
    );
    console.log(serverRes)
  },[serverRes, handleFetch, axiosInstance])

  React.useEffect(()=>{
    handleFetchStreams()
  }, [])

  return (
    <React.Fragment>
      <Header>
        {user?.role == "streamer" ? " " : (
          <Link to="/dashboard/apply">
            <button className="border border-neutral-400 rounded-md px-5 py-2 capitalize font-medium">
              apply for streamer
            </button>
          </Link>
        )}
      </Header>
      <section className="h-[calc(100vh-72px)]">
        <div className="flex w-full gap-x-4 py-3 px-4 min-h-36">
          <div className="w-[45%]"></div>
          <form
            onSubmit={handleCreateStream}
            className="w-[55%] bg-neutral-800 rounded-md px-10 py-10"
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
                <button
                  type="submit"
                  className="py-2 flex gap-x-2 justify-center items-center mx-auto min-w-[200px] bg-sky-600 rounded-md text-white font-medium disabled:bg-neutral-700 disabled:opacity-45"
                >
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
      </section>
    </React.Fragment>
  );
}
