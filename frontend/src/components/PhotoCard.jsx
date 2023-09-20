import React from "react";
import { Avatar, 
         Card, 
         Group, 
         Image, 
         Stack, 
         Text, 
         Tooltip } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import PropTypes from "prop-types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { IconCalendarEvent, 
         IconDisc, 
         IconHeart, 
         IconLock, 
         IconLockOpen, 
         IconShirt, 
         IconStar } from "@tabler/icons-react";

import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";
import { addPhotoCardFavorite, 
         removePhotoCardFavorite } from "../services/photo-cards";

export default function PhotoCard(props) {

    console.log("PhotoCard - at top - props is:");
    console.log(props);
    console.log("Profile - at top - props.username is:");
    console.log(props.photoCard);

    const location = useLocation();

    const largeDisplay = useMediaQuery('(min-width: 430px)');

    const queryClient = useQueryClient();

    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME
    });

    const addPhotoCardFavoriteMutation = useMutation({
        mutationFn: addPhotoCardFavorite,
        onSuccess: () => {
            queryClient.invalidateQueries(["photoCards"]);
        },
        onError: (error) => {
            console.log("PhotoCard.addPhotoCardFavoriteMutation() - got an error");
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
            console.log("PhotoCard.removePhotoCardFavoriteMutation() - got an error");
            console.log(error);
            //TODO - do something here!!
        }
    });

    const addFavoritePhotoCardHandler = async(photoCardId) => {
        console.log("PhotoCard.addFavoritePhotoCardHandler() - at top")
        console.log(photoCardId);
        addPhotoCardFavoriteMutation.mutate(photoCardId);
    }

    const removeFavoritePhotoCardHandler = async(photoCardId) => {
        console.log("PhotoCard.removeFavoritePhotoCardHandler() - at top")
        console.log(photoCardId);
        removePhotoCardFavoriteMutation.mutate(photoCardId);
    }

    //Build content for card owner information
    let cardOwnerContent = '';
    if (location.pathname === '/my-cards') {
        if (props.photoCard.share){
            cardOwnerContent = 
                <Tooltip label="Click to unshare card" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                    <IconLockOpen color={'#fd7e14'} size="1.5rem"  />
                </Tooltip>              
        } else {
            cardOwnerContent = 
                <Tooltip label="Click to share card" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                    <IconLock color={'#fd7e14'} size="1.5rem" />
                </Tooltip>            
        }
    } else {
        if (props.myCard) {
            cardOwnerContent = 
                <Tooltip label={"Your card"} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" 
                         events={{hover: true, touch: true}}>
                    <IconStar size="1.5rem" strokeWidth={2} color={'#fd7e14'} />
                </Tooltip>             
        } else {
            cardOwnerContent = 
                <Tooltip label={'@'+props.photoCard.owner_name} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                    <Avatar radius="xl" size="1.5rem" color="orange" 
                            // onClick={() => {filterListByOwnerHandler(photoCard.owner_name)}} 
                            // style={{cursor:"pointer"}}
                            >
                        {props.photoCard.owner_name.charAt(0).toUpperCase()}
                    </Avatar>
                </Tooltip>               
        }
    } 

    //Build content for card source information 
    let cardSourceContent = null;    
    if (props.photoCard.source_type !== null) {
        if (props.photoCard.source_type === 'album'){
            cardSourceContent =  
                <Tooltip label={props.photoCard.source_name.length > 19 ?
                         `${props.photoCard.source_name.substring(0,19)}...` : props.photoCard.source_name} 
                         color="orange.5" withArrow openDelay={500} radius="sm" fz="sm"
                         events={{hover: true, touch: true}}>
                    <IconDisc size="1.5rem" strokeWidth={2} color={'#fd7e14'}/>
                </Tooltip>            
        } else if (props.photoCard.source_type === 'event') {
            cardSourceContent = 
                <Tooltip label={props.photoCard.source_name.length > 19 ?
                         `${props.photoCard.source_name.substring(0,19)}...` : props.photoCard.source_name} 
                         color="orange.5" withArrow openDelay={500} radius="sm" fz="sm"
                         events={{hover: true, touch: true}}>
                    <IconCalendarEvent size="1.5rem" strokeWidth={2} color={'#fd7e14'}/>
                </Tooltip>
        } else if (props.photoCard.source_type === 'merch') {
            cardSourceContent = 
                <Tooltip label={props.photoCard.source_name.length > 19 ?
                    `${props.photoCard.source_name.substring(0,19)}...` : props.photoCard.source_name} 
                    color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                    <IconShirt size="1.5rem" strokeWidth={2} color={'#fd7e14'}/>
                </Tooltip>
        }
    } 

    let heartContent = null;
    if (currentUserQuery.data?.id === 0){
        heartContent = 
            <Tooltip label="Login to set favorites!" color="orange.5" withArrow openDelay={500} 
                     radius="sm" fz="sm"
                     events={{hover: true, touch: true}}>
                <IconHeart size="1.5rem" strokeWidth={2} color={'#868e96'}/>
            </Tooltip>        
    } else if (currentUserQuery.data?.id !== 0) {
        if (props.photoCard.favorite_id === null){
            heartContent =
            <Tooltip label="Click to set as favorite" color="orange.5" withArrow openDelay={500} 
                     radius="sm" fz="sm">
                <IconHeart size="1.5rem" strokeWidth={2} color={'#868e96'}
                           onClick={()=>addFavoritePhotoCardHandler(props.photoCard.id)}/>
            </Tooltip>        
        } else if (props.photoCard.favorite_id !== null){
            heartContent = 
            <Tooltip label="Click to remove favorite" color="orange.5" withArrow openDelay={500} 
                     radius="sm" fz="sm">
                <IconHeart size="1.5rem" strokeWidth={2} color={'#fd7e14'} fill={'#fd7e14'}
                           onClick={()=>removeFavoritePhotoCardHandler(props.photoCard.id)}/>
            </Tooltip>     
        }   
    }
        
    return (
        <Card radius="md" 
              shadow="md"
              padding="xs"
              key={props.index} 
        >
            <Card.Section component={Link} to={`/card/${props.photoCard.id}`}>
                <Image 
                    src={`/api/photo-cards-${props.photoCard.share ? 'public' : 'private'}/${props.photoCard.front_file_name}`}
                    height={400}
                    // styles={{
                    //     height:350,
                    //     aspectRatio: 16/9
                    // }}
                    // fit="cover"
                />
            </Card.Section>
            <Stack align="flex-start" justify="flex-start" spacing={3}>
                <Text mt={3} size="sm" color="dimmed" ta="right" >{props.photoCard.card_name.length > 18 ?
                                        `${props.photoCard.card_name.substring(0,18)}...` : props.photoCard.card_name}
                </Text>  
                <Group position="right">
                    {cardOwnerContent}
                    {cardSourceContent}
                    {heartContent}
                </Group>              
            </Stack>
        </Card>        

    );

}

PhotoCard.propTypes = {
    photoCard: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    myCard: PropTypes.bool.isRequired,
  };