import axios from "axios";



export async function getFollowee(followerUsername, followeeUsername){

    console.log("follows.getFollowee()");
    
    //if followerUsername is 'unknown' it means no one is logged in, so just return emptry array
    if (followerUsername === "unknown"){
        return [];
    }

    try{
        const response = await axios.get(
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

export async function addFollowee(followeeUsername){

    console.log("addFollowee() - followeeUsername="+followeeUsername+"=");
    console.log(followeeUsername);

    try{
        const response = await axios.post(
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

export async function removeFollowee(followeeUsername){

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
