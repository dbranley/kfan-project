import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {  Button, Grid, Group, MediaQuery, Space, Text } from "@mantine/core";
// import { Heart } from 'tabler-icons-react';
import { IconHeart, IconCircleX, IconLock, IconLockOpen, IconStar, IconDisc, IconCalendarEvent, IconShirt } from "@tabler/icons-react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";
import { getPhotoCards, 
         updatePhotoCard, 
         addPhotoCardFavorite, 
         removePhotoCardFavorite } from "../services/photo-cards";
import PhotoCard from "./PhotoCard";


export default function PhotoCardGalleryGrid(props) {
    console.log("PhotoCardGalleryGrid - at top - props is:");
    console.log(props);
    console.log("PhotoCardGalleryGrid - at top - props.myFavorites is:");
    console.log(props.myFavorites);

    const [ownerName, setOwnerName] = useState(null);

    const [yoursOpened, setYoursOpened] = useState(0);
    const [loginToFavOpened, setLoginToFavOpened] = useState(0);
    const [cardSourceOpened, setCardSourceOpened] = useState(0);

    const location = useLocation();

    const queryClient = useQueryClient();

    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME
    });

    const currentUsername = currentUserQuery.data?.username

    const photoCardsQuery = useQuery({
        queryKey: ["photoCards", props.myCards, props.myFavorites, props.myFollowees, ownerName],
        queryFn: () => getPhotoCards(props.myCards, props.myFavorites, props.myFollowees, ownerName),
        // queryFn: () => getPhotoCard(props.photoCardId)
        enabled: !!currentUsername
    });

    const addPhotoCardFavoriteMutation = useMutation({
        mutationFn: addPhotoCardFavorite,
        onSuccess: () => {
            queryClient.invalidateQueries(["photoCards"]);
        },
        onError: (error) => {
            console.log("PhotoCardGalleryGrid.addPhotoCardFavoriteMutation() - got an error");
            console.log(error);
            //TODO - do something here!!
        }
    });

    const removePhotoCardFavoriteMutation = useMutation({
        mutationFn: removePhotoCardFavorite,
        onSuccess: () => {
            queryClient.invalidateQueries(["photoCards"]);
        },
        onError: (error) => {
            console.log("PhotoCardGalleryGrid.removePhotoCardFavoriteMutation() - got an error");
            console.log(error);
            //TODO - do something here!!
        }
    });

    const updatePhotoCardMutation = useMutation({
        mutationFn: updatePhotoCard,
        onSuccess: () => {
          queryClient.invalidateQueries(["photoCards"]);
        },
        onError: (error) => {
          console.log("PhotoCardGalleryGrid.updatePhotoCardMutation() - got an error: ");
          console.log(error);
          //put on screen!
        }
      });

    useEffect(() => {
        console.log("PhotoCardGalleryGrid.useEffect() - at top")
        if (props.myCards === true){
            setOwnerName(null);
        }        
    }, [props.myCards]);

    if (photoCardsQuery.status === "loading"){
        return <div>Loading...</div>
    }

    if (photoCardsQuery.status === "error"){
        return <div>{JSON.stringify(photoCardsQuery.error)}</div>
    }

    const addFavoritePhotoCardHandler = async(photoCardId) => {
        console.log("PhotoCardGalleryGrid.addFavoritePhotoCardHandler() - at top")
        console.log(photoCardId);
        addPhotoCardFavoriteMutation.mutate(photoCardId);
    }

    const removeFavoritePhotoCardHandler = async(photoCardId) => {
        console.log("PhotoCardGalleryGrid.removeFavoritePhotoCardHandler() - at top")
        console.log(photoCardId);
        removePhotoCardFavoriteMutation.mutate(photoCardId);
    }

    const filterListByOwnerHandler = async(ownerName) => {
        console.log("PhotoCardGalleryGrid.filterListByOwnerHandler() - at top");
        if (props.myCards === false){
            setOwnerName(ownerName);    
        }
    }

    const updatePhotoCardHandler = async(photoCardId, share) => {
        console.log("PhotoCardGalleryGrid.updatePhotoCardHandler() - share is:");
        console.log(share);
        console.log("PhotoCardGalleryGrid.updatePhotoCardHandler() - about to call update mutation")
        updatePhotoCardMutation.mutate({
          id : photoCardId,
          share : share 
        }); 
      };

    console.log("PhotoCardGalleryGrid - location is: ")
    console.log(location);

    return (
        <div>
            <MediaQuery smallerThan={430} styles={{ display: "none"}}>
                <div>
                <Group align="left">
                    {props.myCards === false && props.myFavorites === false && props.myFollowees === false && <Text size="lg" color="orange.9">All Photo Cards</Text>}
                    {props.myCards === true && props.myFavorites === false && props.myFollowees === false && <Text size="lg" color="orange.9">My Photo Cards</Text>}
                    {props.myCards === false && props.myFavorites === true && props.myFollowees === false && <Text size="lg" color="orange.9">Favorites</Text>}
                    {props.myCards === false && props.myFavorites === false && props.myFollowees === true && <Text size="lg" color="orange.9">Following</Text>}
                    {ownerName !== null && 
                     <Button variant="light" radius="xl" size="sm" compact rightIcon={<IconCircleX/>} onClick={() => {filterListByOwnerHandler(null)}}>
                        @{ownerName}
                     </Button>
                    }
                </Group>
                <Space h="md"/>
                <Grid data-testid={`${props.myCards ? "photo-card-grid-left-mine-id" : "photo-card-grid-left-public-id"}`} justify="left" align="start">
                    {photoCardsQuery.data.map((photoCard, index) => (
                        <Grid.Col key={index} span="content" style={{width: 200}} align="left">
                            <PhotoCard photoCard={photoCard} 
                                       index={index} 
                                       myCard={currentUsername === photoCard.owner_name} 
                                       cardHeight={260}/>
                        </Grid.Col>

                    ))}
                </Grid>
                </div>
            </MediaQuery>
            <MediaQuery largerThan={430} styles={{ display: "none"}}>
                <div>
                <Group align="left">
                    {props.myCards === false && props.myFavorites === false && props.myFollowees === false &&<Text size="lg" color="orange.9">All Photo Cards</Text>}
                    {props.myCards === true && props.myFavorites === false && props.myFollowees === false &&<Text size="lg" color="orange.9">My Photo Cards</Text>}
                    {props.myCards === false && props.myFavorites === true && props.myFollowees === false &&<Text size="lg" color="orange.9">Favorites</Text>}
                    {props.myCards === false && props.myFavorites === false && props.myFollowees === true &&<Text size="lg" color="orange.9">Following</Text>}
                    {ownerName !== null && 
                     <Button variant="light" radius="xl" size="sm" compact rightIcon={<IconCircleX/>} onClick={() => {
                        setYoursOpened(0);
                        setLoginToFavOpened(0);
                        filterListByOwnerHandler(null);
                     }}>
                        @{ownerName}
                     </Button>
                    }                    
                </Group>
                <Space h="md"/>
                <Grid data-testid={`${props.myCards ? "photo-card-grid-center-mine-id" : "photo-card-grid-center-public-id"}`} justify="center" align="start">
                    {photoCardsQuery.data.map((photoCard, index) => (
                        <Grid.Col key={index} span="content" style={{width: 300}} align="left">
                            <PhotoCard photoCard={photoCard} 
                                       index={index} 
                                       myCard={currentUsername === photoCard.owner_name} 
                                       cardHeight={400}/>                            
                        </Grid.Col>

                    ))}
                </Grid>
                </div>
            </MediaQuery>            
        </div>
    );

}

PhotoCardGalleryGrid.propTypes = {
    myCards: PropTypes.bool.isRequired,
    myFavorites: PropTypes.bool.isRequired,
    myFollowees: PropTypes.bool.isRequired
  };