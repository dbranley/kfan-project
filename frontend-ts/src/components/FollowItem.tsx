import React from "react";
import { Avatar, 
         Button,
         Center, 
         Group, 
         Loader, 
         Text, } from "@mantine/core";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";

import { getFollowee,
         addFollowee,
         removeFollowee } from "../services/follows";

const FollowItem: React.FC<{followUsername: string}>  = (props) => {

    const queryClient = useQueryClient();

    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME
    });

    const currentUsername = currentUserQuery.data?.username 

    const followeeQuery = useQuery({
        queryKey: ["followeeQuery", props.followUsername, currentUsername],
        queryFn: () => getFollowee(props.followUsername, currentUsername),
        enabled: !!currentUsername
    });

    const addFolloweeMutation = useMutation({
        mutationFn: addFollowee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["followeeQuery", props.followUsername, currentUsername]});
            queryClient.invalidateQueries({ queryKey: ["followeesQuery", currentUsername]});
            queryClient.invalidateQueries({ queryKey: ["photoCards", false, false, true, null]});
            queryClient.invalidateQueries({ queryKey: ["profileUser", currentUsername]});
        },
        onError: (error) => {
            console.log("FollowItem.addFolloweeMutation() - got an error");
            console.log(error);
            //TODO - do something here!!
        }
    });

    const removeFolloweeMutation = useMutation({
        mutationFn: removeFollowee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["followeeQuery", props.followUsername, currentUsername]});
            queryClient.invalidateQueries({ queryKey: ["followeesQuery", currentUsername]});
            queryClient.invalidateQueries({ queryKey: ["photoCards", false, false, true, null]});
            queryClient.invalidateQueries({ queryKey: ["profileUser", currentUsername]});
        },
        onError: (error) => {
            console.log("FollowItem.removeFolloweeMutation() - got an error");
            console.log(error);
            //TODO - do something here!!
        }
    });

    const addFolloweedHandler = async() => {
        console.log("FollowItem.addFolloweedHandler() - at top")
        addFolloweeMutation.mutate(props.followUsername);
    }    

    const removeFolloweedHandler = async() => {
        console.log("FollowItem.removeFolloweedHandler() - at top")
        removeFolloweeMutation.mutate(props.followUsername);
    } 

    if (followeeQuery.status === "pending"){
        return (   
            <Center>
                <Loader/>
            </Center>);
    }

    if (followeeQuery.status === "error"){
        return <div>{JSON.stringify(followeeQuery.error)}</div>
    }

    //Content for the following buttons
    let followButtonContent = <></>; //<Space h="36px"/> //36px is height of default <Button> - so need this to diplay when not showing button
    if (currentUserQuery.data?.id === 0){
        
        followButtonContent = <Button disabled>Login to Follow</Button>
        
    } else if (currentUserQuery.data?.id !== 0){
        
        if (currentUsername != props.followUsername){
            if (followeeQuery?.data?.length === 0){
                followButtonContent = <Button onClick={addFolloweedHandler}>Follow</Button>
            } else {
                followButtonContent = <Button onClick={removeFolloweedHandler} variant="light">Following</Button>
            }
        }
    }    

    //Build content for the 'Follow' item
    const followItemContent = 
        <Group justify="flex-start" >
            <Avatar radius="xl" size="1.5rem" color="orange" component={Link} to={`/profile/${props.followUsername}`}
                    // onClick={() => {filterListByOwnerHandler(photoCard.owner_name)}} 
                    // style={{cursor:"pointer"}}
                    >
                {props.followUsername.charAt(0).toUpperCase()}
            </Avatar>  
            <Text component={Link} to={`/profile/${props.followUsername}`}>{props.followUsername}</Text> 

        </Group>;

    return (
        <Group justify="space-between" >
            {followItemContent}
            {followButtonContent}
        </Group>       
    );
};

export default FollowItem;