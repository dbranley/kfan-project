import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid, Group, Space, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";
import { getPhotoCards } from "../services/photo-cards";
import PhotoCard from "./PhotoCard";
import { useLocation } from "react-router-dom";


const PhotoCardGalleryGrid: React.FC<{myCards: boolean, 
                                      myFavorites: boolean,
                                      myFollowees: boolean
                                    }> = (props) => {
                                        
    console.log("PhotoCardGalleryGrid - at top");    

    const location = useLocation();

    //doing this will force focus to top of page when the url changes
    useEffect(() => {
        window.scrollTo(0,0);
    }, [location]);    

    //1em = 16px, so 28.125em = 450px
    const desktop = useMediaQuery('(min-width: 28.125em)');

    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME
    });

    const currentUsername = currentUserQuery.data?.username;

    const photoCardsQuery = useQuery({
        queryKey: ["photoCards", props.myCards, props.myFavorites, props.myFollowees],
        queryFn: () => getPhotoCards(props.myCards, props.myFavorites, props.myFollowees),
        // queryFn: () => getPhotoCard(props.photoCardId)
        enabled: !!currentUsername
    });

    if (photoCardsQuery.status === "pending"){
        return <div>Loading...</div>
    }
    if (photoCardsQuery.status === "error"){
        return <div>{JSON.stringify(photoCardsQuery.error)}</div>
    }    

    return (
        <>
            {desktop && 
                <>
                    <Group align="left">
                        {props.myCards === false && props.myFavorites === false && props.myFollowees === false && <Text size="lg" c="orange.9">All Photo Cards</Text>}
                        {props.myCards === true && props.myFavorites === false && props.myFollowees === false && <Text size="lg" c="orange.9">My Photo Cards</Text>}
                        {props.myCards === false && props.myFavorites === true && props.myFollowees === false && <Text size="lg" c="orange.9">Favorites</Text>}
                        {props.myCards === false && props.myFavorites === false && props.myFollowees === true && <Text size="lg" c="orange.9">Following</Text>}
                    </Group>
                    <Space h="md"/>
                    <Grid data-testid={`${props.myCards ? "photo-card-grid-left-mine-id" : "photo-card-grid-left-public-id"}`} 
                          justify="left" 
                          align="start">
                        {photoCardsQuery.data.map((photoCard, index) => (
                            <Grid.Col key={index} span="content" style={{width: 200}}> 
                                <PhotoCard photoCard={photoCard} 
                                        index={index} 
                                        myCard={currentUsername === photoCard.owner_name} 
                                        cardHeight={260}/>
                            </Grid.Col>

                        ))}
                    </Grid>
                    
                </>
            }
            {!desktop && 
                <>
                    <Group align="left">
                        {props.myCards === false && props.myFavorites === false && props.myFollowees === false &&<Text size="lg" c="orange.9">All Photo Cards</Text>}
                        {props.myCards === true && props.myFavorites === false && props.myFollowees === false &&<Text size="lg" c="orange.9">My Photo Cards</Text>}
                        {props.myCards === false && props.myFavorites === true && props.myFollowees === false &&<Text size="lg" c="orange.9">Favorites</Text>}
                        {props.myCards === false && props.myFavorites === false && props.myFollowees === true &&<Text size="lg" c="orange.9">Following</Text>}                    
                    </Group>
                    <Space h="md"/>
                    <Grid data-testid={`${props.myCards ? "photo-card-grid-center-mine-id" : "photo-card-grid-center-public-id"}`} 
                          justify="center" 
                          align="start">
                        {photoCardsQuery.data.map((photoCard, index) => (
                            <Grid.Col key={index} span="content" style={{width: 300}}>
                                <PhotoCard photoCard={photoCard} 
                                        index={index} 
                                        myCard={currentUsername === photoCard.owner_name} 
                                        cardHeight={400}/>                            
                            </Grid.Col>

                        ))}
                    </Grid>
                
                </>
            }
        </>
    );
    
};

export default PhotoCardGalleryGrid;