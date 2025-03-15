import React, { FormEventHandler, useCallback } from "react";
import Header from "../../components/header";
import TextInput from "../../components/cui/TextInput";

export default function DashboardPage() {

  const handleCreateStream: FormEventHandler<HTMLFormElement> = useCallback(async (e) => {
    e.preventDefault();
  }, [])

  return (
    <React.Fragment>
      <Header> </Header>
      <section className="h-[calc(100vh-72px)]">
        <div className="flex w-full gap-x-4 py-3 px-4 min-h-36">
          <div className="w-[45%]">
              
          </div>
          <form onSubmit={handleCreateStream} className="w-[55%] bg-neutral-800 rounded-md px-10 py-10">
            <div className="pb-4">
              <h1 className="text-xl font-medium">Create your chat stream</h1>
            </div>
            <div className="flex items-end gap-x-8">
              <TextInput contentClassName="w-full" required label="Title" placeholder="Streaming title" />
              <div className="mb-0.5">
                <button type="submit" className="py-2 flex gap-x-2 justify-center items-center mx-auto min-w-[200px] bg-sky-600 rounded-md text-white font-medium disabled:bg-neutral-700 disabled:opacity-45">
                  <span className="loading data-[loading='true']:block hidden loading-spinner loading-xs"></span>
                  Start new stream
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </React.Fragment>
  )
}
