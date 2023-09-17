import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Center, Container, Loader, Stack, Tabs, Text, Title } from "@mantine/core";
// import { Heart } from 'tabler-icons-react';
import PropTypes from "prop-types";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { SESSION_EXPIRATION_TIME, 
         getCurrentUser } from "../services/auth";

import { getFollowees,
         getFollowers } from "../services/follows";

import FollowItem from "./FollowItem";

export default function FollowsList(props) {

    //doing this will force focus to top of page on 1st render of this detail page
    useEffect(() => {
        window.scrollTo(0,0);
    }, []);    
    
    console.log("FollowList - at top - props is:");
    console.log(props);

    const followersQuery = useQuery({
        queryKey: ["followersQuery", props.username],
        queryFn: () => getFollowers(props.username),
    });

    const followeesQuery = useQuery({
        queryKey: ["followeesQuery", props.username],
        queryFn: () => getFollowees(props.username),
    });

    console.log("FollowsList - about to print followersQuery.status")
    console.log(followersQuery.status)
    console.log("FollowsList - about to print followeesQuery.status")
    console.log(followeesQuery.status)

    if (followersQuery.status === "loading"){
        return (   
            <Center>
                <Loader alignment="center"/>
            </Center>);
    }

    if (followersQuery.status === "error"){
        return <div>{JSON.stringify(followersQuery.error)}</div>
    }

    //Content for the Followers buttons
    let followersContent = <Text mt="sm">No followers</Text>; 
    console.log("FollowsList - printing followersQuery.data: ");
    console.log(followersQuery.data);
    console.log(followersQuery.data.length);

    if (followersQuery.status === "success" &&
        followersQuery.data?.length > 0){
        console.log("FollowsList - in if-block for followersQuery - about to populate followersContent");
        followersContent = 
        <Stack spacing="xl" mt="sm">
            {followersQuery.data.map((followerUsername, index) => (
                <FollowItem key={index} followUsername={followerUsername}/>
            ))}
        </Stack>;      
    }

    //Content for the Followees buttons
    let followeesContent = <Text mt="sm">Not following anyone</Text>; 
    console.log("FollowsList - printing followeesQuery.data: ");
    console.log(followeesQuery.data);
    if (followeesQuery.status === "success" &&
        followeesQuery.data?.length > 0){
        
        followeesContent = 
        <Stack spacing="xl" mt="sm">
            {followeesQuery.data.map((followeeUsername, index) => (
                <FollowItem key={index} followUsername={followeeUsername}/>
            ))}
        </Stack>      
    }
        
    

    return (

        <Container size="xs">
            <Title size="h2" align="center" color="orange.9">{props.username}</Title>
            <Tabs orientation="horizontal"  defaultValue="followers" keepMounted={false}>
                <Tabs.List position="center">
                    <Tabs.Tab value="followers"
                              rightSection={
                                <Badge>{props.followerCount}</Badge>
                              }
                              >
                        Followers
                    </Tabs.Tab>
                    <Tabs.Tab value="following"
                              rightSection={
                                <Badge>{props.followeeCount}</Badge>
                              }                              
                              >
                        Following
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="followers">
                    {followersContent}
                </Tabs.Panel>
                <Tabs.Panel value="following">
                    {followeesContent}
                </Tabs.Panel>
            </Tabs>
        </Container>
    );

}

FollowsList.propTypes = {
    username: PropTypes.string.isRequired,
    followerCount: PropTypes.number.isRequired,
    followeeCount: PropTypes.number.isRequired,
  };