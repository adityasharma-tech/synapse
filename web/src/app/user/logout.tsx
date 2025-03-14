import React from "react"
import { useAppDispatch, useAppSelector } from "../../store"
import { logoutUser } from "../../store/actions/user.actions"

export default function LogoutPage() {

    const dispath = useAppDispatch()
    const loadingStatus = useAppSelector(state => state.app.loadingStatus)

    React.useEffect(() => {
        dispath(logoutUser())
    }, [])
    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col gap-y-5">
                {(loadingStatus == 'pending' || loadingStatus == 'idle') ? <React.Fragment>
                    <span className="text-2xl">Logging you out...</span>
                    <div className="flex gap-x-3 justify-center">
                        <span className="loading loading-bars loading-lg"></span>
                    </div>
                </React.Fragment> : loadingStatus == 'fulfilled' ? <React.Fragment>
                    <span className="text-2xl">Logout success, Redirecting...</span>
                    <div className="flex gap-x-3 justify-center">
                        <span className="loading loading-bars loading-lg"></span>
                    </div>
                </React.Fragment> : <React.Fragment>
                    <span className="text-2xl">Failed to logout.</span>
                </React.Fragment>}
            </div>
        </div>
    )
}
