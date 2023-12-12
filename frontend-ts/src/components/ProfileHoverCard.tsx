import React from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button, Container, Group, Text,  } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";

import { SESSION_EXPIRATION_TIME, 
         getCurrentUser, 
         getUserByUsername,
         defaultUser } from "../services/auth";

import { getFollowee,
         addFollowee,
         removeFollowee } from "../services/follows";


const ProfileHoverCard: React.FC<{username: string 
                                }> = (props) => {

    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME,
    });

    const currentUsername = currentUserQuery.data?.username;

    const profileUserQuery = useQuery({
        queryKey: ["profileUser", props.username],
        queryFn: () => getUserByUsername(props.username),
        // enabled: currentUserQuery.status === "success"
        enabled: !!currentUsername
    });
    
    const followeeQuery = useQuery({
        queryKey: ["followeeQuery", props.username, currentUsername],
        queryFn: () => getFollowee(props.username, currentUsername),
        // enabled: currentUserQuery.status === "success"
        enabled: !!currentUsername
    });    

    const addFolloweeMutation = useMutation({
        mutationFn: addFollowee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["followeeQuery"]});
            queryClient.invalidateQueries({ queryKey: ["profileUser"]});
            queryClient.invalidateQueries({ queryKey: ["followersQuery", props.username]});
            queryClient.invalidateQueries({ queryKey: ["photoCards", false, false, true, null]});
        },
        onError: (error) => {
            console.log("Profile.addFolloweeMutation() - got an error");
            console.log(error);
            //TODO - do something here!!
        }
    });

    const removeFolloweeMutation = useMutation({
        mutationFn: removeFollowee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["followeeQuery"]});
            queryClient.invalidateQueries({ queryKey: ["profileUser"]});
            queryClient.invalidateQueries({ queryKey: ["followersQuery", props.username]});
            queryClient.invalidateQueries({ queryKey: ["photoCards", false, false, true, null]});
        },
        onError: (error) => {
            console.log("Profile.removeFolloweeMutation() - got an error");
            console.log(error);
            //TODO - do something here!!
        }
    });

    if (profileUserQuery.status === "pending"){
        return <div>Loading...</div>
    }

    if (profileUserQuery.status === "error"){
        return <div>{JSON.stringify(profileUserQuery.error)}</div>
    }

    console.log("Profile - location is: ")
    console.log(location);
    
    const addFolloweedHandler = async() => {
        console.log("Profile.addFolloweedHandler() - at top")
        addFolloweeMutation.mutate(props.username);
    }    

    const removeFolloweedHandler = async() => {
        console.log("Profile.removeFolloweedHandler() - at top")
        removeFolloweeMutation.mutate(props.username);
    } 

    //Content for the following buttons
    let followButtonContent = <></>; //<Space h="36px"/> //36px is height of default <Button> - so need this to diplay when not showing button
    if (profileUserQuery.status === "success" && 
        currentUserQuery.data?.id !== 0){
        
        if (currentUserQuery.data.username != profileUserQuery.data.username){
            if (followeeQuery?.data?.length === 0){
                followButtonContent = <Button fullWidth onClick={addFolloweedHandler} mt="xs" size="compact-md">Follow</Button>
            } else {
                followButtonContent = <Button fullWidth onClick={removeFolloweedHandler} variant="light" mt="xs" size="compact-md">Following</Button>
            }
        }
    }

    return (
        <Container pl="0px" pr="0px" pb="0px" pt="0px" >
                <Container pl="0px" pr="0px" pb="0px" pt="0px"
                           style={{cursor:"pointer"}} onClick={()=>{
                                navigate("/profile/"+props.username);}}>
                    <Group justify="space-between">
                        <Text size="xl" fw={600} c="orange.9">@{profileUserQuery.data.username}</Text>
                        <Avatar radius="xl" size="2.0rem" color="orange">{profileUserQuery.data.username.charAt(0).toUpperCase()}</Avatar>
                    </Group>
                    <Group justify="space-between">
                        <Text>{profileUserQuery.data.public_card_count} cards</Text>
                        <Text>{profileUserQuery.data.follower_count} followers</Text>
                    </Group>
                </Container>

                {followButtonContent}
            </Container>        
    );                                    
};

export default ProfileHoverCard;