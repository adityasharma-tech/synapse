import { AxiosResponse } from "axios";
import { ServerErrResponseT, ServerResT } from "./types";
import { toast } from "sonner";

/**
 *
 * @param {Promise<AxiosResponse<any, any>>} axiosRequest Function
 * @param setLoading updates the loading state
 * @param onSuccess accepts a callback function with data
 * @param onError accepts a callback function with error returning
 * @param {boolean} showToast a boolean with default value true to show toast messages
 */
async function requestHandler<T extends ServerResT | any = ServerResT>(
  axiosRequest: Promise<AxiosResponse<any, any>>,
  setLoading?: (loading: boolean) => void,
  onSuccess?: (data: T) => void,
  onError?: (error: ServerErrResponseT | any) => void,
  showToast: boolean = true
) {

  setLoading && setLoading(true);

  try {
    // making the axios request
    const request = await axiosRequest;
    const result = request.data;

    // default showing the toast with the message directly from the server
    showToast &&
      toast(result.message, {
        style: {
          backgroundColor: "#d4d4d4",
          color: "#171717",
          borderColor: "#fff",
        },
      });

    // calling the callback function with the server result;
    if (result.success && onSuccess) onSuccess(result);
  } catch (error: any) {

    // check if response is fromt he server or from the client;
    if (error.response) {
        // showing toast error message
      showToast && toast &&
        toast(error.response.data.message, {
          style: {
            backgroundColor: "#82181a",
            borderColor: "oklch(0.505 0.213 27.518)",
            fontSize: "14px",
          },
        });
      onError && onError(error.response.data);
    } else {
      showToast && toast &&
        toast("Internal server error.", {
          style: {
            backgroundColor: "#82181a",
            borderColor: "oklch(0.505 0.213 27.518)",
            fontSize: "14px",
          },
        });
      onError && onError(error);
    }
  } finally {
    setLoading && setLoading(false);
  }
}

export { requestHandler };
