import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Center, Container, Loader, Stack, Tabs, Text, Title } from "@mantine/core";

import { getFollowees,
         getFollowers } from "../services/follows";

import FollowItem from "./FollowItem";

const FollowsList: React.FC<{username: string
                            followerCount: number,
                            followeeCount: number,
                            followerTab: boolean 
                          }> = (props) => {

    //doing this will force focus to top of page on 1st render of this detail page
    useEffect(() => {
        window.scrollTo(0,0);
    }, []);    
    
    const followersQuery = useQuery({
        queryKey: ["followersQuery", props.username],
        queryFn: () => getFollowers(props.username),
    });

    const followeesQuery = useQuery({
        queryKey: ["followeesQuery", props.username],
        queryFn: () => getFollowees(props.username),
    });
    
    if (followersQuery.status === "error"){
        return <div>{JSON.stringify(followersQuery.error)}</div>
    }

    if (followersQuery.status === "pending"){
        return (   
            <Center>
                <Loader />
            </Center>);
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
        <Stack gap="xl" mt="sm">
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
        <Stack gap="xl" mt="sm">
            {followeesQuery.data.map((followeeUsername, index) => (
                <FollowItem key={index} followUsername={followeeUsername}/>
            ))}
        </Stack>      
    }

    return (

        <Container size="xs">
            <Title size="h2" c="orange.9">{props.username}</Title>
            {/* <Title size="h2" align="center" color="orange.9">{props.username}</Title> */}
            <Tabs orientation="horizontal"  defaultValue={`${props.followerTab ? "followers" : "following"}`} keepMounted={false}>
                <Tabs.List justify="center">
                    <Tabs.Tab value="followers"
                            //   rightSection={
                            //     <Avatar radius="xl" size="1.75rem" color="orange"><Text size="sm">{props.followerCount}</Text></Avatar>
                            //   }
                              >
                        <Text size="sm">{props.followerCount} followers</Text>
                    </Tabs.Tab>
                    <Tabs.Tab value="following"
                            //   rightSection={
                            //     <Avatar radius="xl" size="1.75rem" color="orange"><Text size="sm">{props.followeeCount}</Text></Avatar>
                            //   }                              
                              >
                        <Text size="sm">{props.followeeCount} following</Text>
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

};

export default FollowsList;