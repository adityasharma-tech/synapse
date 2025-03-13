import { AxiosResponse } from "axios";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { toast } from "sonner";

interface ServerResT {
    statusCode: number;
    data: any;
    message: string;
    success: boolean;
}

interface ServerErrResponseT {
    statusCode: number;
    data?: any;
    message: string;
    success: boolean;
    errors?: any[]
}

interface FetcherContextT {
    handleFetch: (axiosFn: Promise<AxiosResponse<any, any>>) => Promise<void>;
    serverRes: null | ServerResT;
    errResponse: null | ServerErrResponseT;
    response: any;
    error: any;
    loading: boolean;
    setDisableToast: (value: boolean) => void;
}

const FetcherContext = createContext<null | FetcherContextT>(null)



const FetcherProvider = ({ children }: PropsWithChildren) => {

    const [serverRes, setServerRes] = useState<null | ServerResT>(null);
    const [errResponse, setErrResponse] = useState<null | ServerErrResponseT>(null);
    const [disableToast, setDisableToast] = useState<boolean>(false);

    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<any>(null);
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

    async function handleFetch(axiosFn: Promise<AxiosResponse<any, any>>) {
        setLoading(true);
        try {
            const result = await axiosFn;
            showToast(result.data.message);
            setResponse(result);
            setServerRes(result.data);
        } catch (err: any) {
            setError(err);
            if (err.response) {
                console.error('Server error:', err.response.data);
                showToast(`Error: ${err.response.data.message}`, "error")
                setErrResponse(err.response.data)
            } else {
                showToast(`Unknown error: ${err.message}`, "error")
                console.error('Unknown error occured: ', err.message);
            }
        } finally {
            setLoading(false)
        }
    }

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