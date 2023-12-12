import axios from "axios";

export type FollowingStats = {
    follower: number,
    followee: number,
    id: number,
}

export async function getFollowee(followeeUsername?: string, followerUsername?: string){

    console.log("follows.getFollowee()");
    
    //if followerUsername is 'undefined' or 'unknown' it means no one is logged in, so just return emptry array
    if (followerUsername === undefined || followerUsername === "unknown"){
        return [];
    }

    try{
        const response = await axios.get<string[]>(
            '/api/followees?follower_username='+followerUsername+'&followee_username='+followeeUsername
        );
        console.log("follows.getFollowee() - response is: ");
        console.log(response);
        return response.data;
    } catch(error){
        //should I rethrow this???
        console.log(error);
        //do not rethrow in this case, just return empty response
        throw error;
    }   

}

export async function getFollowees(followerUsername: string){

    console.log("follows.getFollowees()");
    
    //if followerUsername is 'unknown' it means no one is logged in, so just return emptry array
    if (followerUsername === "unknown"){
        return [];
    }

    try{
        const response = await axios.get<string[]>(
            '/api/followees?follower_username='+followerUsername
        );
        console.log("follows.getFollowees() - response is: ");
        console.log(response);
        return response.data;
    } catch(error){
        //should I rethrow this???
        console.log(error);
        //do not rethrow in this case, just return empty response
        throw error;
    }   

}

export async function getFollowers(followeeUsername: string){

    console.log("follows.getFollowers()");
    
    //if followerUsername is 'unknown' it means no one is logged in, so just return emptry array
    if (followeeUsername === "unknown"){
        return [];
    }

    try{
        const response = await axios.get<string[]>(
            '/api/followers?followee_username='+followeeUsername
        );
        console.log("follows.getFollowers() - response is: ");
        console.log(response);
        return response.data;
    } catch(error){
        //should I rethrow this???
        console.log(error);
        //do not rethrow in this case, just return empty response
        throw error;
    }   

}

export async function addFollowee(followeeUsername: string){

    console.log("addFollowee() - followeeUsername="+followeeUsername+"=");
    console.log(followeeUsername);

    try{
        const response = await axios.post<FollowingStats>(
            '/api/followees?followee_username='+followeeUsername,
        );

        const status = response.status;
        console.log("addFollowee() - at end - response.status is: ");
        console.log(status);
        return response;
    } catch(error){
        console.log("addFollowee() - got exception");
        console.log(error);
        throw error;
    }
}

export async function removeFollowee(followeeUsername: string){

    console.log("removeFollowee() - followeeUsername="+followeeUsername+"=");
    console.log(followeeUsername);

    try{
        const response = await axios.delete(
            '/api/followees?followee_username='+followeeUsername,
        );

        const status = response.status;
        console.log("removeFollowee() - at end - response.status is: ");
        console.log(status);
        return response;
    } catch(error){
        console.log("removeFollowee() - got exception");
        console.log(error);
        throw error;
    }
}