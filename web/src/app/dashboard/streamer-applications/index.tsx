import React, { useState } from "react";
import { requestHandler } from "../../../lib/requestHandler";
import { acceptApplication, fetchAllApplications } from "../../../lib/apiClient";
import LoadingComp from "../../../components/loading";
import { hostBaseUrl } from "../../../lib/constants";

export default function StreamerApplicationsPage() {
  const [loading, setLoading] = useState(false);

  const [applications, setApplications] = useState([]);

  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  const handleFetchApplications = React.useCallback(async () => {
    await requestHandler(fetchAllApplications(), setLoading, (result) => {
      setApplications(result.data.applications);
    });
  }, [requestHandler, fetchAllApplications, setLoading, setApplications]);

  const handleProcessSelected = React.useCallback(async (email: string)=>{
    setLoadingItem(email)
    await requestHandler(acceptApplication(email), undefined, ()=>{
      setLoadingItem(null)
    })
  }, [setLoadingItem, requestHandler, acceptApplication])

  React.useEffect(() => {
    handleFetchApplications();
  }, []);

  return (
    <React.Fragment>
      <header className="justify-between w-full flex py-5 px-6 items-center">
        <div>
          <img className="h-8 w-auto dark:hidden" src="/T&B@2x.png" />
          <img className="h-8 w-auto not-dark:hidden" src="/T&W@2x.png" />
        </div>
        <div className="flex gap-x-3">
          <a href={hostBaseUrl + "/admin/applications-csv"} target="_blank"><button className="button btn-solid">Download as CSV</button></a>
        </div>
      </header>
      {loading ? (
        <LoadingComp />
      ) : (
        <section className="flex h-[calc(90vh+100px)] overflow-y-scroll w-full flex-col">
          <div className="flex justify-between py-2 px-3 mb-4 bg-black border border-neutral-700">
            {applications.length > 0  ? Object.keys(applications[0]).map((value: any, idx) => (
              <span key={idx} className="text-neutral-500">{value}</span>
            )) : null}
            <span className="text-neutral-500">Accept</span>
          </div>
          {applications.map((application: any, idx) => (
            <div
              key={idx}
              className="flex justify-between py-2 items-center px-3 mb-2 bg-black border border-neutral-700"
            >
              {Object.values(application).map((value: any) => (
                <span>{value}</span>
              ))}
              {<button onClick={()=>handleProcessSelected(application.accountEmail)} className={applications[idx]['requestStatus'] === "account_added" ? "btn btn-sm btn-warning" :"btn btn-sm btn-success"}>
                {applications[idx]['requestStatus'] === "account_added" ? "Refresh" : "Accept"}
                {loadingItem == application.accountEmail ? <span className="loading-spinner loading loading-xs"></span> : null}
              </button>}
            </div>
          ))}
        </section>
      )}
    </React.Fragment>
  );
}
