import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button, Card, Container, Grid, Group, Image, MediaQuery, Space, Stack, Text, Tooltip } from "@mantine/core";
// import { Heart } from 'tabler-icons-react';
import { IconHeart, IconCircleX, IconLock, IconLockOpen, IconStar, IconDisc, IconCalendarEvent, IconShirt, IconArrowBigLeft } from "@tabler/icons-react";
import PropTypes from "prop-types";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { SESSION_EXPIRATION_TIME, 
         getCurrentUser, 
         getUserByUsername } from "../services/auth";

import { getFollowee,
         addFollowee,
         removeFollowee } from "../services/follows";


export default function Profile(props) {

    //doing this will force focus to top of page on 1st render of this detail page
    useEffect(() => {
        window.scrollTo(0,0);
    }, []);    
    
    console.log("Profile - at top - props is:");
    console.log(props);
    console.log("Profile - at top - props.username is:");
    console.log(props.username);

    // const [profileUserId, setProfileUserId] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME
    });

    const currentUsername = currentUserQuery.data?.username    

    const profileUserQuery = useQuery({
        queryKey: ["profileUser", props.username],
        queryFn: () => getUserByUsername(props.username),
    });


    const followeeQuery = useQuery({
        queryKey: ["followeeQuery", props.username, currentUsername],
        queryFn: () => getFollowee(currentUsername, props.username),
        enabled: !!currentUsername
    });

    const addFolloweeMutation = useMutation({
        mutationFn: addFollowee,
        onSuccess: () => {
            queryClient.invalidateQueries(["followeeQuery"]);
            queryClient.invalidateQueries(["profileUser"]);
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
            queryClient.invalidateQueries(["followeeQuery"]);
            queryClient.invalidateQueries(["profileUser"]);
        },
        onError: (error) => {
            console.log("Profile.removeFolloweeMutation() - got an error");
            console.log(error);
            //TODO - do something here!!
        }
      });
      
    // const photoCardsQuery = useQuery({
    //     queryKey: ["photoCards", false, false, profileUserId],
    //     queryFn: () => getPhotoCards(false, false, profileUserId),
    //     // queryFn: () => getPhotoCard(props.photoCardId)
    // });


    // useEffect(() => {
    //     console.log("PhotoCardGallaryGrid.useEffect() - at top")
    //     if (props.myCards === true){
    //         setCollectorId(0);
    //         setCollectorName(null);
    //     }        
    // }, [props.myCards]);

    console.log("Profile - about to print profileUserQuery.status")
    console.log(profileUserQuery.status)

    if (profileUserQuery.status === "loading"){
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

    let followButtonContent = <Text>Not logged in or same user</Text>
    if (profileUserQuery.status === "success" && 
        currentUserQuery.status === "success" && 
        currentUserQuery.data !== null && 
        currentUserQuery.data.id !== 0){
        
        if (currentUserQuery.data.username != profileUserQuery.data.username){
            if (followeeQuery?.data?.length === 0){
                followButtonContent = <Button onClick={addFolloweedHandler}>Follow</Button>
            } else {
                followButtonContent = <Button onClick={removeFolloweedHandler} variant="light">Following</Button>
            }
        } else {
            followButtonContent = <Text>Looking at your own profile</Text>
        }
    } else {
        followButtonContent = <Text>Not logged in</Text>
    }
    


    return (
        <Container style={{ background : '#adb5bd'}} size="xs" >
            <Group position="apart">
                <Group>
                    <IconArrowBigLeft size="2rem" fill={'#d9480f'} color={'#d9480f'} onClick={() => navigate(-1)}/>
                    <Text size="xl" fw={700} c="orange.9">@{profileUserQuery.data.username}</Text>
                </Group> 
                <Avatar radius="xl" size="3.0rem" color="orange">{profileUserQuery.data.username.charAt(0).toUpperCase()}</Avatar>
            </Group>
            <Space h="lg"/>
            <Group position="apart" ml="md" mr="md">
                <Text>{profileUserQuery.data.public_card_count} cards</Text>
                <Text>{profileUserQuery.data.follower_count} followers</Text>
                <Text>{profileUserQuery.data.followee_count} following</Text>
            </Group>
            <Space h="lg"/>
            {followButtonContent}
            <Space h="lg"/>
        </Container>
    );

}

Profile.propTypes = {
    username: PropTypes.string.isRequired,
  };