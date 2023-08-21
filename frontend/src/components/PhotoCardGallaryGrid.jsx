import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Badge, Button, Card, Divider, Grid, Group, Image, MediaQuery, Space, Text, Title, Tooltip } from "@mantine/core";
// import { Heart } from 'tabler-icons-react';
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import PropTypes from "prop-types";
import { Link} from "react-router-dom";

import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";
import { getPhotoCards, addPhotoCardFavorite, removePhotoCardFavorite } from "../services/photo-cards";


export default function PhotoCardGallaryGrid(props) {
    console.log("PhotoCardGallaryGrid - at top - props is:");
    console.log(props);
    console.log("PhotoCardGallaryGrid - at top - props.foo is:");
    console.log(props.myFavorites);

    const queryClient = useQueryClient();

    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME
    });

    const photoCardsQuery = useQuery({
        queryKey: ["photoCards", props.myCards, props.myFavorites],
        queryFn: () => getPhotoCards(props.myCards, props.myFavorites),
        // queryFn: () => getPhotoCard(props.photoCardId)
    });

    const addPhotoCardFavoriteMutation = useMutation({
        mutationFn: addPhotoCardFavorite,
        onSuccess: () => {
            queryClient.invalidateQueries(["photoCards"]);
        },
        onError: (error) => {
            console.log("PhotoCardGallaryGrid.addPhotoCardFavoriteMutation() - got an error");
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
            console.log("PhotoCardGallaryGrid.removePhotoCardFavoriteMutation() - got an error");
            console.log(error);
            //TODO - do something here!!
        }
    });

    if (photoCardsQuery.status === "loading"){
        return <div>Loading...</div>
    }

    if (photoCardsQuery.status === "error"){
        return <div>{JSON.stringify(photoCardsQuery.error)}</div>
    }

    const addFavoritePhotoCardHandler = async(photoCardId) => {
        console.log("PhotoCardGallaryGrid.addFavoritePhotoCardHandler() - at top")
        console.log(photoCardId);
        addPhotoCardFavoriteMutation.mutate(photoCardId);
    }

    const removeFavoritePhotoCardHandler = async(photoCardId) => {
        console.log("PhotoCardGallaryGrid.removeFavoritePhotoCardHandler() - at top")
        console.log(photoCardId);
        removePhotoCardFavoriteMutation.mutate(photoCardId);
    }

    return (
        <div>
            <MediaQuery smallerThan={430} styles={{ display: "none"}}>
                <div>
                <Group align="left">
                    {props.myCards === false && props.myFavorites === false &&<Text size="lg" color="orange.9">All Photo Cards</Text>}
                    {props.myCards === true && props.myFavorites === false &&<Text size="lg" color="orange.9">My Photo Cards</Text>}
                    {props.myCards === false && props.myFavorites === true &&<Text size="lg" color="orange.9">My Favorites</Text>}
                    {/* {props.myCards === true && <Badge radius="xl" compact variant="light">My Cards</Badge>}
                    {props.myFavorites === true && <Badge radius="xl" compact variant="light">My Favorites</Badge>} */}
                </Group>
                <Space h="md"/>
                <Grid data-testid={`${props.myCards ? "photo-card-grid-left-mine-id" : "photo-card-grid-left-public-id"}`} justify="left" align="start">
                    {photoCardsQuery.data.map((photoCard, index) => (
                        <Grid.Col key={index} span="content" style={{width: 200}} align="left">
                        <Card radius="sm" 
                            shadow="md"
                            padding="sm"
                            key={index} 
                        >
                            <Card.Section component={Link} to={`/card/${photoCard.id}`}>
                                <Image 
                                    src={`/api/photo-cards-${photoCard.share ? 'public' : 'private'}/${photoCard.front_file_name}`}
                                    height={260}
                                    // fit="contain"
                                />
                            </Card.Section>
                            <Group position="apart" mt="md">
                            {/* <Group position="" mt="md"> */}
                                <Text mt="md" size="sm" color="dimmed" ta="right" >{photoCard.card_name.length > 10 ?
                                        `${photoCard.card_name.substring(0,10)}...` : photoCard.card_name}
                                </Text>
                            {/* </Group> */}
                            <Group position="right" mt="md" >
                                <Tooltip label={photoCard.owner_name} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                    <Avatar radius="xl" size="sm" color="orange">{photoCard.owner_name.charAt(0).toUpperCase()}</Avatar>
                                </Tooltip>      
                                {currentUserQuery.status === "success" && 
                                 currentUserQuery.data !== null && 
                                 currentUserQuery.data.id !== 0 ? (
                                    photoCard.favorite_id === null ? (
                                        <IconHeart onClick={()=>addFavoritePhotoCardHandler(photoCard.id)} style={{cursor:"pointer"}} size="1.1rem" strokeWidth={2} color={'#868e96'}/>
                                    ) : (
                                        <IconHeart onClick={()=>removeFavoritePhotoCardHandler(photoCard.id)} style={{cursor:"pointer"}} size="1.1rem" strokeWidth={3} color={'#fd7e14'} fill={'#fd7e14'}/>
                                    )                                    
                                 ) : (
                                    <Tooltip label="Login to set favorites!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                        <IconHeart size="1.1rem" strokeWidth={2} color={'#868e96'}/>
                                    </Tooltip>
                                 )
                                }
                            </Group>
                            </Group>
                        </Card>
                        </Grid.Col>

                    ))}
                </Grid>
                </div>
            </MediaQuery>
            <MediaQuery largerThan={430} styles={{ display: "none"}}>
                <div>
                <Group align="left">
                    {props.myCards === false && props.myFavorites === false &&<Text size="lg" color="orange.9">All Photo Cards</Text>}
                    {props.myCards === true && props.myFavorites === false &&<Text size="lg" color="orange.9">My Photo Cards</Text>}
                    {props.myCards === false && props.myFavorites === true &&<Text size="lg" color="orange.9">My Favorites</Text>}
                    {/* {props.myCards === true && <Badge radius="xl" compact variant="light">My Cards</Badge>}
                    {props.myFavorites === true && <Badge radius="xl" compact variant="light">My Favorites</Badge>} */}
                </Group>
                <Space h="md"/>
                <Grid data-testid={`${props.myCards ? "photo-card-grid-center-mine-id" : "photo-card-grid-center-public-id"}`} justify="center" align="start">
                    {photoCardsQuery.data.map((photoCard, index) => (
                        <Grid.Col key={index} span="content" style={{width: 200}} align="left">
                        <Card radius="sm" 
                            shadow="md"
                            padding="sm"
                            key={index} 
                        >
                            <Card.Section component={Link} to={`/card/${photoCard.id}`}>
                                <Image 
                                    src={`/api/photo-cards-${photoCard.share ? 'public' : 'private'}/${photoCard.front_file_name}`}
                                    height={260}
                                    // fit="contain"
                                />
                            </Card.Section>
                            <Group position="apart">
                                <Text component={Link} to={`/card/${photoCard.id}`} size="sm" color="dimmed" mt="md">{photoCard.card_name.length > 10 ?
                                        `${photoCard.card_name.substring(0,10)}...` : photoCard.card_name}
                                </Text>
                                <Group position="right" mt="md" >    
                                    <Avatar radius="xl" size="sm" color="orange">{photoCard.owner_name.charAt(0).toUpperCase()}</Avatar>                   
                                    {currentUserQuery.status === "success" && 
                                    currentUserQuery.data !== null && 
                                    currentUserQuery.data.id !== 0 ? (
                                        photoCard.favorite_id === null ? (
                                            <IconHeart onClick={()=>addFavoritePhotoCardHandler(photoCard.id)} style={{cursor:"pointer"}} size="1.1rem" strokeWidth={2} color={'#868e96'}/>
                                        ) : (
                                            <IconHeart onClick={()=>removeFavoritePhotoCardHandler(photoCard.id)} style={{cursor:"pointer"}} size="1.1rem" strokeWidth={3} color={'#fd7e14'} fill={'#fd7e14'}/>
                                        )                                    
                                    ) : (
                                        <IconHeart size="1.1rem" strokeWidth={2} color={'#868e96'}/>
                                    )
                                    
                                    }
                                </Group>
                            </Group>
                        </Card>
                        </Grid.Col>

                    ))}
                </Grid>
                </div>
            </MediaQuery>            
        </div>
    );

}

PhotoCardGallaryGrid.propTypes = {
    myCards: PropTypes.bool.isRequired,
    myFavorites: PropTypes.bool.isRequired,
  };