import React from "react";
import { useParams } from "react-router-dom";

import Profile from "../components/Profile";

export default function ProfilePage() {

    const params= useParams();

    console.log("ProfilePage - useParams is:");
    console.log(params);
    console.log("ProfilePage - useParams.username is:");
    console.log(params.username);

    let username : string = '';
    if (params.username === undefined){
        return <div>Profile username is required</div>
    } else {
        username = params.username;
    }
    


    return (
        <div>
            <Profile username={username}/>
        </div>
    );

}