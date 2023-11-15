import axios, { AxiosError } from "axios";

export function extractMessageFromRestError(error: Error | AxiosError) : string{
    console.log("extractMessageFromRestError() - error is:")
    console.log(error)
    let retMessage = error.message;

    //now see if we can find a better message
    if (axios.isAxiosError(error)){
        if (error.response != null && error.response.data !== null && error.response.data.detail !== null){
            console.log(error.response.data.detail);
            retMessage = error.response.data.detail;
        }
    }
    return retMessage;
}