import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button,  Center, Container, Divider, Grid, Group,  Loader,  Modal,  ScrollArea,  Space,  Text,  } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import {  IconArrowBigLeft } from "@tabler/icons-react";

import { useNavigate } from "react-router-dom";

import { SESSION_EXPIRATION_TIME, 
         getCurrentUser, 
         getUserByUsername } from "../services/auth";

import { getFollowee,
         addFollowee,
         removeFollowee } from "../services/follows";

import { getPhotoCards } from "../services/photo-cards";
import PhotoCard from "./PhotoCard";
import FollowsList from "./FollowsList";

const Profile: React.FC<{username: string}> = (props) => {

    //for modal
    const [opened, { open, close }] = useDisclosure(false);

    //doing this will force focus to top of page on 1st render of this detail page
    useEffect(() => {
        window.scrollTo(0,0);
        close();
        setFollowTab(true);
    }, [props.username, close]);    

    console.log("Profile - at top - props is:");
    console.log(props);

    const navigate = useNavigate();
    const queryClient = useQueryClient();    

    const [underlineFollowers, setUnderlineFollowers] = useState(false);
    const [underlineFollowing, setUnderlineFollowing] = useState(false);
    const [followTab, setFollowTab] = useState(true);

    //for modal
    // const [opened, { open, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 430px)");
    let modalRadius = 6;
    if (isMobile){
        modalRadius = 0;
    }

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
        enabled: currentUsername !== undefined && currentUsername !== "unknown" //!!currentUsername
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
        return <Center><Loader mt="xl"/></Center>
    }

    if (profileUserQuery.status === "error"){
        return <div>{JSON.stringify(profileUserQuery.error)}</div>
    }

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
        
        if (currentUserQuery.data?.username != profileUserQuery.data.username){
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
            <Loader/>
        </Center>
    if (photoCardsQuery.status === "error"){
        photoCardsContent = 
            <Center>
                <div>{JSON.stringify(photoCardsQuery.error)}</div>
            </Center> 
    }
    if (photoCardsQuery.status === "success"){
        if (isMobile){
            photoCardsContent = 
            <Grid justify="center" >
                {photoCardsQuery.data.map((photoCard, index) => (
                    <Grid.Col key={index} span="content" style={{width: 300}} >
                        <PhotoCard photoCard={photoCard} index={index} myCard={currentUsername === props.username} cardHeight={400}/>
                    </Grid.Col>
                ))}
            </Grid>
        } else {
            photoCardsContent = 
            <Grid justify="left" >
                {photoCardsQuery.data.map((photoCard, index) => (
                    <Grid.Col key={index} span="content" style={{width: 200}} >
                        <PhotoCard photoCard={photoCard} index={index} myCard={currentUsername === props.username} cardHeight={260}/>
                    </Grid.Col>
                ))}
            </Grid>
        }
    }

    return (
        <div>
            <Modal opened={opened} 
                   onClose={() =>{
                    queryClient.invalidateQueries({ queryKey: ["profileUser", props.username]});
                    queryClient.invalidateQueries({ queryKey: ["followersQuery", props.username]});
                    queryClient.invalidateQueries({ queryKey: ["followeesQuery", props.username]});
                    close();
                   }} 
                   fullScreen={isMobile} 
                   withCloseButton={isMobile}
                   scrollAreaComponent={ScrollArea.Autosize}
                   radius={modalRadius}
                   closeButtonProps={{ size: 'lg' }}
                   >
                <FollowsList username={profileUserQuery.data.username} 
                             followerCount={profileUserQuery.data.follower_count}
                             followeeCount={profileUserQuery.data.followee_count}
                             followerTab={followTab}/>
            </Modal>            
            <Container size="xs" >
        {/* <Container style={{ background : '#adb5bd'}} size="xs" > */}
                <Group justify="space-between">
                    <Group>
                        <IconArrowBigLeft size="2rem" fill={'#d9480f'} color={'#d9480f'} 
                                          style={{cursor:"pointer"}}
                                          onClick={() => navigate(-1)}/>
                        <Text size="xl" fw={700} c="orange.9">@{profileUserQuery.data.username}</Text>
                    </Group> 
                    <Avatar radius="xl" size="3.0rem" color="orange">{profileUserQuery.data.username.charAt(0).toUpperCase()}</Avatar>
                </Group>
                <Space h="lg"/>
                <Group justify="space-between" ml="sm" mr="sm" mb="sm">
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
            </Container>
            <Divider size="sm" color="orange.4" mt="sm"/>
            <Space h="lg"/>
            {photoCardsContent}
            <Space h="xl"/>
        </div>
    );
};

export default Profile;