import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button, Card, Grid, Group, Image, MediaQuery, Space, Stack, Text, Tooltip } from "@mantine/core";
// import { Heart } from 'tabler-icons-react';
import { IconHeart, IconCircleX, IconLock, IconLockOpen, IconStar, IconDisc, IconCalendarEvent, IconShirt } from "@tabler/icons-react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";
import { getPhotoCards, 
         updatePhotoCard, 
         addPhotoCardFavorite, 
         removePhotoCardFavorite } from "../services/photo-cards";


export default function PhotoCardGallaryGrid(props) {
    console.log("PhotoCardGallaryGrid - at top - props is:");
    console.log(props);
    console.log("PhotoCardGallaryGrid - at top - props.myFavorites is:");
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
        queryKey: ["photoCards", props.myCards, props.myFavorites, ownerName],
        queryFn: () => getPhotoCards(props.myCards, props.myFavorites, ownerName),
        // queryFn: () => getPhotoCard(props.photoCardId)
        enabled: !!currentUsername
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

    const updatePhotoCardMutation = useMutation({
        mutationFn: updatePhotoCard,
        onSuccess: () => {
          queryClient.invalidateQueries(["photoCards"]);
        },
        onError: (error) => {
          console.log("PhotoCardGallaryGrid.updatePhotoCardMutation() - got an error: ");
          console.log(error);
          //put on screen!
        }
      });

    useEffect(() => {
        console.log("PhotoCardGallaryGrid.useEffect() - at top")
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
        console.log("PhotoCardGallaryGrid.addFavoritePhotoCardHandler() - at top")
        console.log(photoCardId);
        addPhotoCardFavoriteMutation.mutate(photoCardId);
    }

    const removeFavoritePhotoCardHandler = async(photoCardId) => {
        console.log("PhotoCardGallaryGrid.removeFavoritePhotoCardHandler() - at top")
        console.log(photoCardId);
        removePhotoCardFavoriteMutation.mutate(photoCardId);
    }

    const filterListByOwnerHandler = async(ownerName) => {
        console.log("PhotoCardGallaryGrid.filterListByOwnerHandler() - at top");
        if (props.myCards === false){
            setOwnerName(ownerName);    
        }
    }

    const updatePhotoCardHandler = async(photoCardId, share) => {
        console.log("PhotoCardGallaryGrid.updatePhotoCardHandler() - share is:");
        console.log(share);
        console.log("PhotoCardGallaryGrid.updatePhotoCardHandler() - about to call update mutation")
        updatePhotoCardMutation.mutate({
          id : photoCardId,
          share : share 
        }); 
      };

    console.log("PhotoCardGallaryGrid - location is: ")
    console.log(location);

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
                        <Card radius="md" 
                            shadow="md"
                            padding="xs"
                            key={index} 
                        >
                            <Card.Section component={Link} to={`/card/${photoCard.id}`}>
                                <Image 
                                    src={`/api/photo-cards-${photoCard.share ? 'public' : 'private'}/${photoCard.front_file_name}`}
                                    height={260}
                                    // styles={{
                                    //     height:350,
                                    //     aspectRatio: 16/9
                                    // }}
                                    // fit="cover"
                                />
                            </Card.Section>
                            <Stack align="flex-start" justify="flex-start" spacing={3}>
                            {/* <Group position="" mt="md"> */}
                                <Text mt={3} size="sm" color="dimmed" ta="right" >{photoCard.card_name.length > 18 ?
                                        `${photoCard.card_name.substring(0,18)}...` : photoCard.card_name}
                                </Text>
                            {/* </Group> */}
                            <Group position="right" >
                                {location.pathname === '/my-cards' && 
                                    ((photoCard.share &&
                                        <Tooltip label="Click to unshare card" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                            <IconLockOpen color={'#fd7e14'} size="1.5rem" onClick={()=>updatePhotoCardHandler(photoCard.id, false)} />
                                        </Tooltip>
                                    ) || (
                                        <Tooltip label="Click to share card" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                            <IconLock color={'#fd7e14'} size="1.5rem" onClick={()=>updatePhotoCardHandler(photoCard.id, true)}/>
                                        </Tooltip>
                                    )) 
                                }
                                {(location.pathname !== '/my-cards' &&  
                                    ((currentUsername === photoCard.owner_name) ? (
                                        <Tooltip label={"Your card"} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                            <IconStar size="1.5rem" strokeWidth={2} color={'#fd7e14'} />
                                        </Tooltip>                                         

                                     ) : (
                                        <Tooltip label={'@'+photoCard.owner_name} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                            <Avatar radius="xl" size="1.5rem" color="orange" 
                                                    onClick={() => {filterListByOwnerHandler(photoCard.owner_name)}} 
                                                    style={{cursor:"pointer"}}>
                                                {photoCard.owner_name.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </Tooltip>                                         
                                     ))

                                    )                                  
                                }

                                {photoCard.source_type !== null &&
                                 photoCard.source_type === 'album' &&
                                     <Tooltip label={photoCard.source_name.length > 19 ?
                                        `${photoCard.source_name.substring(0,19)}...` : photoCard.source_name} 
                                        color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                         <IconDisc size="1.5rem" strokeWidth={2} color={'#fd7e14'}/>
                                     </Tooltip>
                                }
                                {photoCard.source_type !== null &&
                                 photoCard.source_type === 'event' &&
                                     <Tooltip label={photoCard.source_name.length > 19 ?
                                        `${photoCard.source_name.substring(0,19)}...` : photoCard.source_name} 
                                        color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                         <IconCalendarEvent size="1.5rem" strokeWidth={2} color={'#fd7e14'}/>
                                     </Tooltip>
                                }
                                {photoCard.source_type !== null &&
                                 photoCard.source_type === 'merch' &&
                                     <Tooltip label={photoCard.source_name.length > 19 ?
                                        `${photoCard.source_name.substring(0,19)}...` : photoCard.source_name} 
                                        color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                         <IconShirt size="1.5rem" strokeWidth={2} color={'#fd7e14'}/>
                                     </Tooltip>
                                }
                         
                                {currentUserQuery.status === "success" && 
                                 currentUserQuery.data !== null && 
                                 currentUserQuery.data.id !== 0 ? (
                                    photoCard.favorite_id === null ? (
                                        <Tooltip label="Click to set as favorite" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                            <IconHeart onClick={()=>addFavoritePhotoCardHandler(photoCard.id)} style={{cursor:"pointer"}} size="1.5rem" strokeWidth={2} color={'#868e96'}/>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip label="Click to remove favorite" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                            <IconHeart onClick={()=>removeFavoritePhotoCardHandler(photoCard.id)} style={{cursor:"pointer"}} size="1.5rem" strokeWidth={2} color={'#fd7e14'} fill={'#fd7e14'}/>
                                        </Tooltip>
                                    )                                    
                                 ) : (
                                    <Tooltip label="Login to set favorites!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                                        <IconHeart size="1.5rem" strokeWidth={2} color={'#868e96'}/>
                                    </Tooltip>
                                 )
                                }
                            </Group>
                            </Stack>
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
                        <Grid.Col key={index} span="content" style={{width: 200}} align="left">
                        <Card radius="md" 
                            shadow="md"
                            padding="xs"
                            key={index} 
                        >
                            <Card.Section component={Link} to={`/card/${photoCard.id}`}>
                                <Image 
                                    src={`/api/photo-cards-${photoCard.share ? 'public' : 'private'}/${photoCard.front_file_name}`}
                                    height={260}
                                    // fit="contain"
                                />
                            </Card.Section>
                            <Stack align="flex-start" justify="flex-start" spacing={3}>
                                <Text mt={3} size="sm" color="dimmed" ta="right">{photoCard.card_name.length > 18 ?
                                        `${photoCard.card_name.substring(0,18)}...` : photoCard.card_name}
                                </Text>
                                <Group position="right" >    
                                    {location.pathname === '/my-cards' && 
                                        ((photoCard.share &&
                                            <IconLockOpen color={'#fd7e14'} size="1.5rem" onClick={()=> {
                                                setCardSourceOpened(0);
                                                updatePhotoCardHandler(photoCard.id, false);
                                            }} />
                                        ) || (
                                            <IconLock color={'#fd7e14'} size="1.5rem" onClick={()=>{
                                                setCardSourceOpened(0);
                                                updatePhotoCardHandler(photoCard.id, true);
                                            }}/>
                                        )) 
                                    }
                                    {(location.pathname !== '/my-cards' && 
                                        ((currentUsername === photoCard.owner_name) ? (
                                        <Tooltip label={"Your card"} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={yoursOpened === photoCard.id}>
                                            <IconStar size="1.5rem" strokeWidth={2} color={'#fd7e14'} onClick={() => {
                                                if (yoursOpened === 0){
                                                    setYoursOpened(photoCard.id);
                                                    setCardSourceOpened(0);
                                                } else if (yoursOpened === photoCard.id){
                                                    setYoursOpened(0);
                                                } else {
                                                    setCardSourceOpened(0);
                                                    setYoursOpened(photoCard.id);
                                                }
                                            }}/>
                                        </Tooltip>                                         

                                        ) : (
                                        <Avatar radius="xl" size="1.5rem" color="orange" 
                                                onClick={() => {
                                                    setYoursOpened(0);
                                                    setLoginToFavOpened(0);
                                                    setCardSourceOpened(0);
                                                    filterListByOwnerHandler(photoCard.owner_name);
                                                }} 
                                                style={{cursor:"pointer"}}>
                                            {photoCard.owner_name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        ))
                                     )                                                                     
                                    }
                               
                                    {photoCard.source_type !== null &&
                                    photoCard.source_type === 'album' &&
                                        <Tooltip label={photoCard.source_name.length > 19 ?
                                            `${photoCard.source_name.substring(0,19)}...` : photoCard.source_name} 
                                            color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={cardSourceOpened === photoCard.id}>
                                            <IconDisc size="1.5rem" strokeWidth={2} color={'#fd7e14'} onClick={() => {
                                                if (cardSourceOpened === 0){
                                                    setYoursOpened(0);
                                                    setLoginToFavOpened(0);
                                                    setCardSourceOpened(photoCard.id);
                                                } else if (cardSourceOpened === photoCard.id){
                                                    setCardSourceOpened(0);
                                                } else {
                                                    setYoursOpened(0);
                                                    setLoginToFavOpened(0);
                                                    setCardSourceOpened(photoCard.id);
                                                }
                                            }}/>
                                        </Tooltip>
                                    }
                                    {photoCard.source_type !== null &&
                                    photoCard.source_type === 'event' &&
                                        <Tooltip label={photoCard.source_name.length > 19 ?
                                            `${photoCard.source_name.substring(0,19)}...` : photoCard.source_name} 
                                            color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={cardSourceOpened === photoCard.id}>
                                            <IconCalendarEvent size="1.5rem" strokeWidth={2} color={'#fd7e14'} onClick={() => {
                                                if (cardSourceOpened === 0){
                                                    setYoursOpened(0);
                                                    setLoginToFavOpened(0);
                                                    setCardSourceOpened(photoCard.id);
                                                } else if (cardSourceOpened === photoCard.id){
                                                    setCardSourceOpened(0);
                                                } else {
                                                    setYoursOpened(0);
                                                    setLoginToFavOpened(0);
                                                    setCardSourceOpened(photoCard.id);
                                                }
                                            }}/>
                                        </Tooltip>
                                    }
                                    {photoCard.source_type !== null &&
                                    photoCard.source_type === 'merch' &&
                                        <Tooltip label={photoCard.source_name.length > 19 ?
                                            `${photoCard.source_name.substring(0,19)}...` : photoCard.source_name} 
                                                 color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={cardSourceOpened === photoCard.id}>
                                            <IconShirt size="1.5rem" strokeWidth={2} color={'#fd7e14'} onClick={() => {
                                                if (cardSourceOpened === 0){
                                                    setYoursOpened(0);
                                                    setLoginToFavOpened(0);
                                                    setCardSourceOpened(photoCard.id);
                                                } else if (cardSourceOpened === photoCard.id){
                                                    setCardSourceOpened(0);
                                                } else {
                                                    setYoursOpened(0);
                                                    setLoginToFavOpened(0);
                                                    setCardSourceOpened(photoCard.id);
                                                }
                                            }}/>
                                        </Tooltip>
                                    }

                                    {currentUserQuery.status === "success" && 
                                    currentUserQuery.data !== null && 
                                    currentUserQuery.data.id !== 0 ? (
                                        photoCard.favorite_id === null ? (
                                            <IconHeart onClick={()=>{
                                                setYoursOpened(0);
                                                setLoginToFavOpened(0);
                                                setCardSourceOpened(0);
                                                addFavoritePhotoCardHandler(photoCard.id);
                                            }} style={{cursor:"pointer"}} size="1.5rem" strokeWidth={2} color={'#868e96'}/>
                                        ) : (
                                            <IconHeart onClick={()=>{
                                                setYoursOpened(0);
                                                setLoginToFavOpened(0);
                                                setCardSourceOpened(0);
                                                removeFavoritePhotoCardHandler(photoCard.id);
                                            }} style={{cursor:"pointer"}} size="1.5rem" strokeWidth={3} color={'#fd7e14'} fill={'#fd7e14'}/>
                                        )                                    
                                    ) : (
                                        // <IconHeart size="1.1rem" strokeWidth={2} color={'#868e96'}/>
                                        <Tooltip label="Login to set favorites!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={loginToFavOpened === photoCard.id}>
                                            <IconHeart size="1.5rem" strokeWidth={2} color={'#868e96'} onClick={() => {
                                                if (loginToFavOpened === 0){
                                                    setCardSourceOpened(0);
                                                    setLoginToFavOpened(photoCard.id);
                                                } else if (loginToFavOpened === photoCard.id){
                                                    setLoginToFavOpened(0);
                                                } else {
                                                    setCardSourceOpened(0);
                                                    setLoginToFavOpened(photoCard.id);
                                                }
                                            }}/>
                                        </Tooltip>                                        
                                    )
                                    
                                    }
                                </Group>
                            </Stack>
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