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

export function validateEmail(email: string) : boolean{

    const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;

    if (email === null || email.length === 0){
        return false;
    }
    
    if (email.search(regex) === 0){
        return true;
    } else {
        return false;
    }

}