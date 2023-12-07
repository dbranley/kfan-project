import React from "react";
import { Avatar, 
         Card, 
         Flex, 
         Group, 
         HoverCard, 
         Image, 
         Stack, 
         Text, 
         Tooltip } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";         
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
         updatePhotoCard, 
         removePhotoCardFavorite } from "../services/photo-cards";
import ProfileHoverCard from "./ProfileHoverCard";         
import { PhotoCard as PhotoCardData } from "../services/photo-cards";


const PhotoCard: React.FC<{photoCard: PhotoCardData, 
                           index: number,
                           myCard: boolean,
                           cardHeight: number
                        }> = (props) => {

    const location = useLocation();

    //1em = 16px, so 28.125em = 450px
    const desktop = useMediaQuery('(min-width: 28.125em)');

    const queryClient = useQueryClient();
    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME
    });

    const addPhotoCardFavoriteMutation = useMutation({
        mutationFn: addPhotoCardFavorite,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["photoCards"]});
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
            queryClient.invalidateQueries({ queryKey: ["photoCards"]});
        },
        onError: (error) => {
            console.log("PhotoCard.removePhotoCardFavoriteMutation() - got an error");
            console.log(error);
            //TODO - do something here!!
        }
    });

    const updatePhotoCardMutation = useMutation({
        mutationFn: updatePhotoCard,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["photoCards"]});
        },
        onError: (error) => {
          console.log("PhotoCard.updatePhotoCardMutation() - got an error: ");
          console.log(error);
          //put on screen!
        }
    }); 

    const addFavoritePhotoCardHandler = async(photoCardId: number) => {
        console.log("PhotoCard.addFavoritePhotoCardHandler() - at top")
        console.log(photoCardId);
        addPhotoCardFavoriteMutation.mutate(photoCardId);
    }

    const removeFavoritePhotoCardHandler = async(photoCardId: number) => {
        console.log("PhotoCard.removeFavoritePhotoCardHandler() - at top")
        console.log(photoCardId);
        removePhotoCardFavoriteMutation.mutate(photoCardId);
    }

    const updatePhotoCardHandler = async(photoCardId: number, share: boolean) => {
        console.log("PhotoCard.updatePhotoCardHandler() - share is:");
        console.log(share);
        console.log("PhotoCard.updatePhotoCardHandler() - about to call update mutation")
        updatePhotoCardMutation.mutate({
          id : photoCardId,
          share : share 
        }); 
    };   

    //Build content for card owner information
    let cardOwnerContent = <></>;
    if (location.pathname === '/my-cards') {
        if (props.photoCard.share){
            cardOwnerContent = 
                <Tooltip label="Click to unshare card" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                    <IconLockOpen color={'#fd7e14'} size="1.5rem" onClick={()=>updatePhotoCardHandler(props.photoCard.id, false)} />
                </Tooltip>              
        } else {
            cardOwnerContent = 
                <Tooltip label="Click to share card" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                    <IconLock color={'#fd7e14'} size="1.5rem" onClick={()=>updatePhotoCardHandler(props.photoCard.id, true)} />
                </Tooltip>            
        }
    } else {
        if (props.myCard) {
            cardOwnerContent = 
                <Tooltip label={"Your card"} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" 
                         events={{hover: true, focus: false, touch: true}}>
                    <IconStar size="1.5rem" strokeWidth={2} color={'#fd7e14'} />
                </Tooltip>             
        } else {
            if (location.pathname.startsWith("/profile") ){
                cardOwnerContent = 
                <Tooltip label={'@'+props.photoCard.owner_name} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                    <Avatar radius="xl" size="1.5rem" color="orange" 
                            // onClick={() => {filterListByOwnerHandler(photoCard.owner_name)}} 
                            // style={{cursor:"pointer"}}
                            >
                        {props.photoCard.owner_name.charAt(0).toUpperCase()}
                    </Avatar>
                </Tooltip>               
            } else {
                //if not on profile page, then display HoverCard with profile info
                cardOwnerContent = 
                <Group align="center">
                    <HoverCard shadow="md"  
                               openDelay={400} 
                               closeDelay={200} 
                               withinPortal={true} 
                               radius="md"
                               >
                        <HoverCard.Target>
                            <Avatar radius="xl" size="1.5rem" color="orange" 
                                    component={Link} to={`/profile/${props.photoCard.owner_name}`}>
                                {props.photoCard.owner_name.charAt(0).toUpperCase()}
                            </Avatar>
                        </HoverCard.Target>
                        <HoverCard.Dropdown >
                            <ProfileHoverCard username={props.photoCard.owner_name}/>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </Group>              
            }
        }
    } 
    //Build content for card source information 
    let cardSourceContent = <></>;    
    if (props.photoCard.source_type !== null) {
        if (props.photoCard.source_type === 'album'){
            cardSourceContent =  
                <Tooltip label={props.photoCard.source_name.length > 19 ?
                         `${props.photoCard.source_name.substring(0,19)}...` : props.photoCard.source_name} 
                         color="orange.5" withArrow openDelay={500} radius="sm" fz="sm"
                         events={{hover: true, focus: false, touch: true}}>
                    <IconDisc size="1.5rem" strokeWidth={2} color={'#fd7e14'}/>
                </Tooltip>            
        } else if (props.photoCard.source_type === 'event') {
            cardSourceContent = 
                <Tooltip label={props.photoCard.source_name.length > 19 ?
                         `${props.photoCard.source_name.substring(0,19)}...` : props.photoCard.source_name} 
                         color="orange.5" withArrow openDelay={500} radius="sm" fz="sm"
                         events={{hover: true, focus: false, touch: true}}>
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
    let heartContent = <></>;
    if (currentUserQuery.data?.id === 0){
        heartContent = 
            <Tooltip label="Login to set favorites!" color="orange.5" withArrow openDelay={500} 
                     radius="sm" fz="sm"
                     events={{hover: true, focus: false, touch: true}}>
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
                    height={props.cardHeight}
                    // styles={{
                    //     height:350,
                    //     aspectRatio: 16/9
                    // }}
                    // fit="cover"
                />
            </Card.Section>
            <Stack align="flex-start" justify="flex-start" gap="xs">
                <Text mt={3} size="sm" c="dimmed" ta="right" >{props.photoCard.card_name.length > 18 ?
                                        `${props.photoCard.card_name.substring(0,18)}...` : props.photoCard.card_name}
                </Text>  
                <Group justify="flex-end">
                    {cardOwnerContent}
                    {cardSourceContent}
                    <Flex gap="0.15rem" justify="flex-start" align="flex-end">
                        {heartContent}
                        <Text mt={6} size="xs" c="dimmed">{props.photoCard.favorite_cnt}</Text>
                    </Flex>
                </Group>              
            </Stack>
        </Card>           
    );
};

export default PhotoCard;