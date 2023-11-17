import axios from "axios";

export const SESSION_EXPIRATION_TIME = 300000;

export type User = {
    username: string,
    id: number,
    email: string,
    upload: boolean
}

// loginUserData object is:
//   username
//   password
export async function login(loginUserData: { username: string; password: string }){

    try{
        const response = await axios.post(
            '/api/login',
            {
                username: loginUserData.username,
                password: loginUserData.password
            },
            {withCredentials: true}
        );
        if (response.status != 200){
            throw new Error('Request failed - status code='+response.status+'=, status text='+response.statusText+'=');
        }
        const data = await response.data; 
        return data;

    } catch(error){
        console.log(error);
        throw(error);
    }

}

export async function logout(){

    console.log("auth.logout()");

    try{
        console.log("auth.logout() - about to use axios to post to 'logout'");
        const response = await axios.post(
            '/api/logout',
            {},
            {
              withCredentials: true,
              // headers: {'Access-Control-Allow-Origin': 'same-origin'}
            }
        );
        if (response.status != 200){
            throw new Error('Request failed - status code='+response.status+'=, status text='+response.statusText+'=');
        }
        // const data = await response.data;

    } catch(error){
        console.log(error);
        throw(error);
    }
}

export async function register(registerUserData: { username: string; email: string, password: string }){

    try{
        const response = await axios.post<User>(
            '/api/register',
            {
                username: registerUserData.username,
                email: registerUserData.email,
                password: registerUserData.password
            }
        );
        if (response.status != 200){
            throw new Error('Request failed - status code='+response.status+'=, status text='+response.statusText+'=');
        }
        const data = response.data;
        return data;

    } catch(error){
        console.log(error);
        throw(error);
    }
}
export async function getCurrentUser(){

    console.log("auth.getCurrentUser()");
    
    try{
        const response = await axios.get<User>(
            '/api/session'
        );
        console.log("auth.getCurrentUser() - response is: ");
        console.log(response);
        return response.data;
    } catch(error){
        //should I rethrow this???
        console.log(error);
        //do not rethrow in this case, just return empty response
        throw error;
    }   

}