import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button,  Center, Container, Divider, Grid, Group,  Loader,  Modal,  ScrollArea,  Space,  Text,  } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
// import { Heart } from 'tabler-icons-react';
import {  IconArrowBigLeft } from "@tabler/icons-react";
import PropTypes from "prop-types";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { SESSION_EXPIRATION_TIME, 
         getCurrentUser, 
         getUserByUsername } from "../services/auth";

import { getFollowee,
         addFollowee,
         removeFollowee } from "../services/follows";

import { getPhotoCards } from "../services/photo-cards";
import PhotoCard from "./PhotoCard";
import FollowsList from "./FollowsList";

export default function Profile(props) {

    //doing this will force focus to top of page on 1st render of this detail page
    useEffect(() => {
        window.scrollTo(0,0);
        close();
        setFollowTab(true);
    }, [props.username]);    
    
    console.log("Profile - at top - props is:");
    console.log(props);
    console.log("Profile - at top - props.username is:");
    console.log(props.username);

    // const [profileUserId, setProfileUserId] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    //for underlining follow links on hover
    const [underlineFollowers, setUnderlineFollowers] = useState(false);
    const [underlineFollowing, setUnderlineFollowing] = useState(false);
    const [followTab, setFollowTab] = useState(true);

    //for modal
    const [opened, { open, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 430px)");

    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME
    });

    const currentUsername = currentUserQuery.data?.username    

    const profileUserQuery = useQuery({
        queryKey: ["profileUser", props.username],
        queryFn: () => getUserByUsername(props.username),
        enabled: !!currentUsername
    });

    const photoCardsQuery = useQuery({
        queryKey: ["photoCards", (currentUsername === props.username), false, false, props.username],
        queryFn: () => getPhotoCards((currentUsername === props.username), false, false, props.username),
        enabled: !!currentUsername
        // queryFn: () => getPhotoCard(props.photoCardId)
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
            queryClient.invalidateQueries(["followersQuery", props.username]);
            queryClient.invalidateQueries("photoCards", false, false, true, null);
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
            queryClient.invalidateQueries(["followersQuery", props.username]);
            queryClient.invalidateQueries("photoCards", false, false, true, null);
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

    //Content for the following buttons
    let followButtonContent = null; //<Space h="36px"/> //36px is height of default <Button> - so need this to diplay when not showing button
    if (profileUserQuery.status === "success" && 
        currentUserQuery.data?.id !== 0){
        
        if (currentUserQuery.data.username != profileUserQuery.data.username){
            if (followeeQuery?.data?.length === 0){
                followButtonContent = <Button onClick={addFolloweedHandler}>Follow</Button>
            } else {
                followButtonContent = <Button onClick={removeFolloweedHandler} variant="light">Following</Button>
            }
        }
    }
    
    //Content for the photo cards
    let photoCardsContent = 
        <Center>
            <Loader alignment="center"/>
        </Center>
    if (photoCardsQuery.status === "error"){
        photoCardsContent = 
            <Center>
                <div>{JSON.stringify(photoCardsQuery.error)}</div>
            </Center> 
    }
    if (photoCardsQuery.status === "success"){
        photoCardsContent = 
            <Grid justify="center" >
                {photoCardsQuery.data.map((photoCard, index) => (
                    <Grid.Col key={index} span="content" style={{width: 300}} align="left">
                        <PhotoCard photoCard={photoCard} index={index} myCard={currentUsername === props.username} cardHeight="400"/>
                    </Grid.Col>
                ))}
            </Grid>
    }

    return (
        <div>
            <Modal opened={opened} 
                   onClose={() =>{
                    queryClient.invalidateQueries(["profileUser", props.username]);
                    queryClient.invalidateQueries(["followersQuery", props.username]);
                    queryClient.invalidateQueries(["followeesQuery", props.username]);
                    close();
                   }} 
                   fullScreen={isMobile} 
                   withCloseButton={isMobile}
                   scrollAreaComponent={ScrollArea.Autosize}
                   radius="md"
                   closeButtonProps={{ size: 'lg', align: 'center'}}
                   >
                <FollowsList username={profileUserQuery.data.username} 
                             followerCount={profileUserQuery.data.follower_count}
                             followeeCount={profileUserQuery.data.followee_count}
                             followerTab={followTab}/>
            </Modal>            
            <Container size="xs" >
        {/* <Container style={{ background : '#adb5bd'}} size="xs" > */}
                <Group position="apart">
                    <Group>
                        <IconArrowBigLeft size="2rem" fill={'#d9480f'} color={'#d9480f'} onClick={() => navigate(-1)}/>
                        <Text size="xl" fw={700} c="orange.9">@{profileUserQuery.data.username}</Text>
                    </Group> 
                    <Avatar radius="xl" size="3.0rem" color="orange">{profileUserQuery.data.username.charAt(0).toUpperCase()}</Avatar>
                </Group>
                <Space h="lg"/>
                <Group position="apart" ml="sm" mr="sm" mb="sm">
                    <Text>{profileUserQuery.data.public_card_count} cards</Text>
                    <Text onClick={()=>{
                            setFollowTab(true);
                            open();
                          }} 
                          style={{cursor:"pointer"}}
                          td={`${underlineFollowers && !isMobile ? "underline" : ""}`}
                          onMouseEnter={()=>setUnderlineFollowers(true)}
                          onMouseLeave={()=>setUnderlineFollowers(false)}>
                        {profileUserQuery.data.follower_count} followers
                    </Text>
                    <Text onClick={()=>{
                            setFollowTab(false);
                            open();
                          }} 
                          style={{cursor:"pointer"}}
                          td={`${underlineFollowing && !isMobile ? "underline" : ""}`}
                          onMouseEnter={()=>setUnderlineFollowing(true)}
                          onMouseLeave={()=>setUnderlineFollowing(false)}>                    
                        {profileUserQuery.data.followee_count} following
                    </Text>
                </Group>

                {followButtonContent}
                <Divider size="sm" color="orange.4" mt="sm"/>
                <Space h="lg"/>
                {photoCardsContent}
                <Space h="xl"/>
            </Container>
        </div>
    );

}

Profile.propTypes = {
    username: PropTypes.string.isRequired,
  };