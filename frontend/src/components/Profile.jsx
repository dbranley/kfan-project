import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button, Card, Grid, Group, Image, MediaQuery, Space, Stack, Text, Tooltip } from "@mantine/core";
// import { Heart } from 'tabler-icons-react';
import { IconHeart, IconCircleX, IconLock, IconLockOpen, IconStar, IconDisc, IconCalendarEvent, IconShirt } from "@tabler/icons-react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

import { SESSION_EXPIRATION_TIME, 
         getCurrentUser, 
         getUserByUsername } from "../services/auth";


export default function Profile(props) {
    console.log("Profile - at top - props is:");
    console.log(props);
    console.log("Profile - at top - props.username is:");
    console.log(props.username);

    // const [profileUserId, setProfileUserId] = useState(0);

    const location = useLocation();

    const queryClient = useQueryClient();

    // const currentUserQuery = useQuery({
    //     queryKey: ["currentUser"],
    //     queryFn: getCurrentUser,
    //     staleTime: SESSION_EXPIRATION_TIME
    // });

    const profileUserQuery = useQuery({
        queryKey: ["profileUser", props.username],
        queryFn: () => getUserByUsername(props.username),
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

    return (
        <div>
            <Group align="left">
                <Text size="lg" color="orange.9">@{profileUserQuery.data.username}</Text>
                <Avatar radius="xl" size="1.5rem" color="orange">{profileUserQuery.data.username.charAt(0).toUpperCase()}</Avatar>
            </Group>
        </div>
    );

}

Profile.propTypes = {
    username: PropTypes.string.isRequired,
  };