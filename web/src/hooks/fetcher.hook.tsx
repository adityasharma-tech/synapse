import { AxiosResponse } from "axios";
import { createContext, PropsWithChildren, RefObject, useCallback, useContext, useRef, useState } from "react";
import { toast } from "sonner";
import { ServerErrResponseT, ServerResT } from "../lib/types";

interface FetcherContextT {
    handleFetch: (axiosFn: Promise<AxiosResponse<any, any>>) => Promise<void>;
    serverRes: RefObject<ServerResT | null>;
    errResponse: RefObject<ServerErrResponseT | null>;
    response: RefObject<any>;
    error: RefObject<any>;
    loading: boolean;
    setDisableToast: (value: boolean) => void;
}

const FetcherContext = createContext<null | FetcherContextT>(null)



const FetcherProvider = ({ children }: PropsWithChildren) => {

    const serverRes = useRef<null | ServerResT>(null)
    const errResponse = useRef<null | ServerErrResponseT>(null)
    
    const [disableToast, setDisableToast] = useState<boolean>(false);

    const response = useRef<any>(null); 
    const error = useRef<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    function showToast(message: string, variant: "error" | "success" | "default" = "default") {
        const toastStyle = variant == "default" ? {
            backgroundColor: "#d4d4d4",
            color: "#171717",
            borderColor: "#fff"
        } : variant == "error" ? {
            backgroundColor: "#82181a",
            borderColor: "oklch(0.505 0.213 27.518)",
            fontSize: "14px"
        } : {}
        if (!disableToast)
            toast(message, {
                style: toastStyle,
                duration: 2200,
                position: "bottom-right"
            })
    }

    const handleFetch = useCallback(async (axiosFn: Promise<AxiosResponse<any, any>>)=>{
        setLoading(true);
        try {
            const result = await axiosFn;
            showToast(result.data.message);
            response.current = result;
            serverRes.current = result.data;
        } catch (err: any) {
            error.current = err;
            if (err.response) {
                console.error('Server error:', err.response.data);
                errResponse.current = err.response.data
                showToast(`Error: ${err.response.data.message}`, "error")
            } else {
                console.error('Unknown error occured: ', err.message);
                showToast(`Unknown error: ${err.message}`, "error")
            }
        } finally {
            setLoading(false)
        }
    }, [setLoading, showToast, response, serverRes, error, errResponse])

    return <FetcherContext.Provider value={{ handleFetch, serverRes, errResponse, response, error, loading, setDisableToast }}>
        {children}
    </FetcherContext.Provider>
}

const useFetcher = () => {
    const fetcher = useContext(FetcherContext);
    if (!fetcher)
        throw new Error("It seems you forgot to wrap your app inside FetcherProvider!")

    return fetcher;
}

export {
    FetcherProvider,
    useFetcher
}