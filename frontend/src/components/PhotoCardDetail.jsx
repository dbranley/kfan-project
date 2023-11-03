import React, { useEffect, useState } from "react";
import { Avatar, 
         Container, 
         Divider, 
         Flex, 
         Group, 
         Image, 
         MediaQuery, 
         Space, 
         Text, 
         TextInput, 
         Tooltip } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link  } from "react-router-dom";
import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";
import { IconHeart, 
         IconTrash, 
         IconLock, 
         IconLockOpen, 
         IconArrowBigLeft,
         IconDisc,
         IconCalendarEvent,
         IconShirt,
         IconPencil } from "@tabler/icons-react";

import { getPhotoCard, 
         deletePhotoCard, 
         updatePhotoCard,
         addPhotoCardFavorite, 
         removePhotoCardFavorite} from "../services/photo-cards";

import { extractMessageFromRestError } from "../utils";
import InlineTextEdit from "./InlineTextEdit";

const PhotoCardDetail = (props) => {

  const [deleteError, setDeleteError] = useState(null);
  const [ownerOpened, setOwnerOpened] = useState(false);
  const [loginToFavOpened, setLoginToFavOpened] = useState(false);
  const [cardSourceOpened, setCardSourceOpened] = useState(false);
  const [editingCardName, setEditingCardName] = useState(false);

  const navigate = useNavigate();

  //doing this will force focus to top of page on 1st render of this detail page
  useEffect(() => {
    window.scrollTo(0,0);
  }, []);

  const queryClient = useQueryClient();

  const currentUserQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: SESSION_EXPIRATION_TIME
  });

  const currentUsername = currentUserQuery.data?.username

  const photoCardQuery = useQuery({
    queryKey: ["photoCards", props.photoCardId],
    queryFn: () => getPhotoCard(props.photoCardId),
    enabled: !!currentUsername
  });

  const deletePhotoCardMutation = useMutation({
      mutationFn: deletePhotoCard,
      onSuccess: (data, variables, context) => {
          queryClient.invalidateQueries(["photoCards"])
          navigate('/');
      },
      onError: (error) => {
          console.log("PhotoCardDetails - deletePhotoCardMutation() - got an error: ");
          console.log(error);
          setDeleteError("Delete failed with '"+extractMessageFromRestError(error)+"'");
      }

  });

  const updatePhotoCardMutation = useMutation({
    mutationFn: updatePhotoCard,
    onSuccess: () => {
      setDeleteError(null);
      queryClient.invalidateQueries(["photoCards"]);
    },
    onError: (error) => {
      console.log("PhotoCardDetails - updatePhotoCardMutation() - got an error: ");
      console.log(error);
      setDeleteError("Update failed with '"+extractMessageFromRestError(error)+"'");
    }
  });

  const addPhotoCardFavoriteMutation = useMutation({
    mutationFn: addPhotoCardFavorite,
    onSuccess: () => {
        queryClient.invalidateQueries(["photoCards"]);
    },
    onError: (error) => {
        console.log("PhotoCardDetail.addPhotoCardFavoriteMutation() - got an error");
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
        console.log("PhotoCardDetail.removePhotoCardFavoriteMutation() - got an error");
        console.log(error);
        //TODO - do something here!!
    }
  });  

  const deletePhotoCardHandler = async () => {
    console.log("PhotoCardDetails - deletePhotoCardHandler() - about to call delete mutation");
    deletePhotoCardMutation.mutate(photoCardQuery.data.id);
  }

  const updatePhotoCardShareHandler = async(photoCardId, share) => {
    console.log("PhotoCardDetails - updatePhotoCardShareHandler() - share is:");
    console.log(share);
    console.log("PhotoCardDetails - updatePhotoCardShareHandler() - about to call update mutation")
    updatePhotoCardMutation.mutate({
      id : photoCardId,
      share : share 
    }); //, share);
  };

  const updatePhotoCardNameHandler = async(newPhotoCardName) => {
    console.log("PhotoCardDetail.updatePhotoCardNameHandler() - at top");
    console.log(newPhotoCardName);
    console.log("PhotoCardDetail.updatePhotoCardNameHandler() - about to call update mutation");
    
    updatePhotoCardMutation.mutate({
      id : props.photoCardId,
      cardName : newPhotoCardName 
    });
  };  

  const updatePhotoCardGroupNameHandler = async(newPhotoCardGroupName) => {
    console.log("PhotoCardDetail.updatePhotoCardGroupNameHandler() - at top");
    console.log(newPhotoCardGroupName);
    console.log("PhotoCardDetail.updatePhotoCardGroupNameHandler() - about to call update mutation");
    
    updatePhotoCardMutation.mutate({
      id : props.photoCardId,
      groupName : newPhotoCardGroupName 
    });
  };  

  const updatePhotoCardSourceNameHandler = async(newPhotoCardSourceName) => {
    console.log("PhotoCardDetail.updatePhotoCardSourceNameHandler() - at top");
    console.log(newPhotoCardSourceName);
    console.log("PhotoCardDetail.updatePhotoCardSourceNameHandler() - about to call update mutation");
    
    updatePhotoCardMutation.mutate({
      id : props.photoCardId,
      sourceName : newPhotoCardSourceName 
    });
  };  

  const addFavoritePhotoCardHandler = async(photoCardId) => {
    console.log("PhotoCardDetail.addFavoritePhotoCardHandler() - at top")
    console.log(photoCardId);
    addPhotoCardFavoriteMutation.mutate(photoCardId);
  }

  const removeFavoritePhotoCardHandler = async(photoCardId) => {
    console.log("PhotoCardDetail.removeFavoritePhotoCardHandler() - at top")
    console.log(photoCardId);
    removePhotoCardFavoriteMutation.mutate(photoCardId);
  }

  if (photoCardQuery.status === "loading") {
    return <div>Loading...</div>;
  }

  if (photoCardQuery.status === "error") {
    return <div>{JSON.stringify(photoCardQuery.error)}</div>;
  }

  console.log("PhotoCardDetail - photoCardQuery.data is: ");
  console.log(photoCardQuery.data);

  let deleteErrorContent = null;
  if (deleteError !== null){
    deleteErrorContent = <div><Text size="md" c="red" align="left">{deleteError}</Text></div>;
  } 

  let cardNameContentLarge = 
      <Text size="xl" fw={700} c="brown">{photoCardQuery.data.card_name}</Text>;      
  let cardNameContentSmall = 
      <Text size="xl" fw={700} c="brown">{photoCardQuery.data.card_name.length > 22 ?
          `${photoCardQuery.data.card_name.substring(0,22)}...` : photoCardQuery.data.card_name}</Text>
  
  let groupNameContentLarge =
    <Text c="orange" fz="xl">{photoCardQuery.data.group_name}</Text>;
  let groupNameContentSmall = 
    <Text c="orange" fz="xl">{photoCardQuery.data.group_name.length > 27 ?
        `${photoCardQuery.data.group_name.substring(0,27)}...` : photoCardQuery.data.group_name}</Text>;
  
  let cardSourceNameContentLarge = 
    <Text c="orange" fz="xl">{photoCardQuery.data.source_name}</Text>;
  let cardSourceNameContentSmall = 
    <Text c="orange" fz="xl">{('source_name' in photoCardQuery.data && 
                               photoCardQuery.data.source_name !== null && 
                               photoCardQuery.data.source_name.length > 22) ?
        `${photoCardQuery.data.source_name.substring(0,22)}...` : photoCardQuery.data.source_name }</Text>
    
  if (currentUsername === photoCardQuery.data.owner_name){
    cardNameContentLarge =
      <InlineTextEdit text={photoCardQuery.data.card_name} 
                      size="xl" 
                      fontWeight={700} 
                      color="brown"
                      onChange={updatePhotoCardNameHandler}/>;
    cardNameContentSmall = 
      <InlineTextEdit text={photoCardQuery.data.card_name} 
                      size="xl" 
                      fontWeight={700} 
                      color="brown"
                      maxDisplayLength={20}
                      onChange={updatePhotoCardNameHandler}/>;

    groupNameContentLarge =
      <InlineTextEdit text={photoCardQuery.data.group_name} 
                      size="xl" 
                      fontWeight={0} 
                      color="orange"
                      onChange={updatePhotoCardGroupNameHandler}/>;
    groupNameContentSmall = 
      <InlineTextEdit text={photoCardQuery.data.group_name} 
                      size="xl" 
                      fontWeight={0} 
                      color="orange"
                      maxDisplayLength={24}
                      onChange={updatePhotoCardGroupNameHandler}/>;                      
 
    cardSourceNameContentLarge =
      <InlineTextEdit text={photoCardQuery.data.source_name} 
                      size="xl" 
                      fontWeight={0} 
                      color="orange"
                      onChange={updatePhotoCardSourceNameHandler}/>;
    cardSourceNameContentSmall = 
      <InlineTextEdit text={photoCardQuery.data.source_name} 
                      size="xl" 
                      fontWeight={0} 
                      color="orange"
                      maxDisplayLength={20}
                      onChange={updatePhotoCardSourceNameHandler}/>;                        
  } 

  return (
    <Container px={0}>
      <MediaQuery smallerThan={430} styles={{ display: "none"}}>
        <div>
          <Group>
            <IconArrowBigLeft size="2rem" fill={'#d9480f'} color={'#d9480f'} 
                              style={{cursor:"pointer"}}
                              onClick={() => navigate(-1)}/>
            {cardNameContentLarge}
            {/* <Text size="xl" fw={700} c="brown">{photoCardQuery.data.card_name}</Text>
            <IconPencil strokeWidth={2} color="brown"/> */}
          </Group>          
        <Carousel draggable={false} withControls={false} slideGap="xs" slideSize="50%" withIndicators={false} align="start" mt="xs">
                  {/* styles={{ control: {
                                '&[data-inactive]': {opacity : 0, cursor: 'default',}
                                    }
                        }}> */}
          <Carousel.Slide>
            <Image
              src={`/api/photo-cards-${
                photoCardQuery.data.share ? "public" : "private"
              }/${photoCardQuery.data.front_file_name}`}
              height={500}
              fit="contain"
            />
          </Carousel.Slide>
          <Carousel.Slide>
            <Image
              src={`/api/photo-cards-${
                photoCardQuery.data.share ? "public" : "private"
              }/${photoCardQuery.data.back_file_name}`}
              height={500}
              fit="contain"
            />
          </Carousel.Slide>
        </Carousel>
        <Container fluid ml="0rem" mt="0.5rem">
          {groupNameContentLarge}
          {/* <Text c="orange" fz="xl">{photoCardQuery.data.group_name}</Text> */}
          <Space h="md"/>
          {photoCardQuery.data.source_type !== null &&
           photoCardQuery.data.source_type === 'album' &&
            <div>
              <Group>
                <Tooltip label="From an album!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                  <IconDisc size="2rem" strokeWidth={2} color={'#fd7e14'}/>
                </Tooltip>
                {cardSourceNameContentLarge}
                {/* <Text c="orange" fz="xl">{photoCardQuery.data.source_name}</Text> */}
              </Group>
              <Space h="md"/>
            </div>
          }
          {photoCardQuery.data.source_type !== null &&
           photoCardQuery.data.source_type === 'event' &&
            <div>
              <Group>
                <Tooltip label="From an event!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                  <IconCalendarEvent size="2rem" strokeWidth={2} color={'#fd7e14'}/>
                </Tooltip>
                {cardSourceNameContentLarge}
                {/* <Text c="orange" fz="xl">{photoCardQuery.data.source_name}</Text> */}
              </Group>
              <Space h="md"/>
            </div>
          }          
          {photoCardQuery.data.source_type !== null &&
           photoCardQuery.data.source_type === 'merch' &&
            <div>
              <Group>
                <Tooltip label="From some merch!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                  <IconShirt size="2rem" strokeWidth={2} color={'#fd7e14'}/>
                </Tooltip>
                {cardSourceNameContentLarge}
                {/* <Text c="orange" fz="xl">{photoCardQuery.data.source_name}</Text> */}
              </Group>
              <Space h="md"/>
            </div>
          }
          {deleteErrorContent}
          {/* {deleteError != null && <div><Text size="md" c="red" align="left">{deleteError}</Text></div>} */}
          <Group position="left" spacing="xl">
          {/* <Text c="orange" fz="xl">{photoCardQuery.data.group_name}</Text> */}
          <Tooltip label={'@'+photoCardQuery.data.owner_name} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
            <Avatar radius="xl" size="md" color="orange"  component={Link} to={`/profile/${photoCardQuery.data.owner_name}`}>
              {photoCardQuery.data.owner_name.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>        
        {/* TODO: Move heart content to a separate variable so I can just replace that with logic below*/}
        {currentUserQuery.status === "success" && 
                currentUserQuery.data !== null && 
                currentUserQuery.data.id !== 0 ? (
                  photoCardQuery.data.favorite_id === null ? (
                    <Flex gap="0.15rem" justify="flex-start" align="flex-end">
                      <IconHeart onClick={()=>{
                        addFavoritePhotoCardHandler(photoCardQuery.data.id);
                      }} style={{cursor:"pointer"}} size="2rem" strokeWidth={1} color={'#868e96'}/>
                      <Text size="xs" color="dimmed">{photoCardQuery.data.favorite_cnt}</Text>
                    </Flex>
                  ) : (
                    <Flex gap="0.15rem" justify="flex-start" align="flex-end">
                      <IconHeart onClick={()=>{
                        removeFavoritePhotoCardHandler(photoCardQuery.data.id);
                      }} style={{cursor:"pointer"}} size="2rem" strokeWidth={3} color={'#fd7e14'} fill={'#fd7e14'}/>
                      <Text  size="xs" color="dimmed">{photoCardQuery.data.favorite_cnt}</Text>
                    </Flex>
                  )                                    

                ) : (
                  <Flex gap="0.15rem" justify="flex-start" align="flex-end">
                    <Tooltip label="Login to set favorites!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                      <IconHeart ml={10} size="2rem" strokeWidth={1} color={'#868e96'} />
                    </Tooltip>
                    <Text size="xs" color="dimmed">{photoCardQuery.data.favorite_cnt}</Text>
                  </Flex>
                )
        }
        {currentUsername === photoCardQuery.data.owner_name && 
                ((photoCardQuery.data.share &&
                  <IconLockOpen color={'#fd7e14'} size="2rem" onClick={()=>{
                    updatePhotoCardShareHandler(photoCardQuery.data.id, false);
                  }}/>
                ) || (
                  <IconLock color={'#fd7e14'} size="2rem" onClick={()=>{
                    updatePhotoCardShareHandler(photoCardQuery.data.id, true);
                  }}/>
                ))    
        }
        {currentUsername === photoCardQuery.data.owner_name && 
                  <IconTrash onClick={deletePhotoCardHandler} size="2rem" color={'#fd7e14'}/>
        }              
        </Group>
        </Container>   
        </div>     
      </MediaQuery>
      <MediaQuery largerThan={430} styles={{ display: "none"}}>
        {/* <Space h="xs"/> */}
        <div>
          <Group>
            <IconArrowBigLeft size="2rem" fill={'#d9480f'} color={'#d9480f'} onClick={() => navigate(-1)}/>
            {cardNameContentSmall}
            {/* <Text size="xl" fw={700} c="brown">{photoCardQuery.data.card_name.length > 24 ?
                                        `${photoCardQuery.data.card_name.substring(0,24)}...` : photoCardQuery.data.card_name}</Text> */}
          </Group>          
          <Carousel withIndicators dragFree mt="xs" controlSize={30} slideGap="xs" 
                styles={{ control: {
                  '&[data-inactive]': {opacity : 0, cursor: 'default',}
                      }
                  }}>
            <Carousel.Slide>
              <Image
                src={`/api/photo-cards-${
                  photoCardQuery.data.share ? "public" : "private"
                }/${photoCardQuery.data.front_file_name}`}
                height={380}
                fit="contain"
              />
            </Carousel.Slide>
            <Carousel.Slide>
              <Image
                src={`/api/photo-cards-${
                  photoCardQuery.data.share ? "public" : "private"
                }/${photoCardQuery.data.back_file_name}`}
                height={380}
                fit="contain"
              />
            </Carousel.Slide>
          </Carousel>
          <Container fluid px={0} ml="0rem" mt="0.5rem">
          {groupNameContentSmall}
          {/* <Text c="orange" fz="xl">{photoCardQuery.data.group_name}</Text> */}
          {/* <Space h="xs"/> */}
          {photoCardQuery.data.source_type !== null &&
           photoCardQuery.data.source_type === 'album' &&
            <div>
              <Group spacing="xs">
                <Tooltip label="From an album!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={cardSourceOpened}>
                  <IconDisc size="2rem" strokeWidth={2} color={'#fd7e14'} onClick={()=>{
                    setOwnerOpened(false);
                    setLoginToFavOpened(false);
                    setCardSourceOpened((o)=>!o);
                  }}/>
                </Tooltip>
                {cardSourceNameContentSmall}
                {/* <Text c="orange" fz="xl">{photoCardQuery.data.source_name.length > 27 ?
                                        `${photoCardQuery.data.source_name.substring(0,27)}...` : photoCardQuery.data.source_name }</Text> */}
              </Group>
              <Space h="xs"/>
            </div>
          }
          {photoCardQuery.data.source_type !== null &&
           photoCardQuery.data.source_type === 'event' &&
            <div>
              <Group spacing="xs">
                <Tooltip label="From an event!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={cardSourceOpened}>
                  <IconCalendarEvent size="2rem" strokeWidth={2} color={'#fd7e14'} onClick={()=>{
                    setOwnerOpened(false);
                    setLoginToFavOpened(false);
                    setCardSourceOpened((o)=>!o);
                  }}/>
                </Tooltip>
                {cardSourceNameContentSmall}
                {/* <Text c="orange" fz="xl">{photoCardQuery.data.source_name.length > 27 ?
                                        `${photoCardQuery.data.source_name.substring(0,27)}...` : photoCardQuery.data.source_name }</Text> */}
              </Group>
              <Space h="xs"/>
            </div>
          }          
          {photoCardQuery.data.source_type !== null &&
           photoCardQuery.data.source_type === 'merch' &&
            <div>
              <Group spacing="xs">
                <Tooltip label="From some merch!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={cardSourceOpened}>
                  <IconShirt size="2rem" strokeWidth={2} color={'#fd7e14'} onClick={()=>{
                    setOwnerOpened(false);
                    setLoginToFavOpened(false);
                    setCardSourceOpened((o)=>!o);
                  }}/>
                </Tooltip>
                {cardSourceNameContentSmall}
                {/* <Text c="orange" fz="xl">{photoCardQuery.data.source_name.length > 27 ?
                                        `${photoCardQuery.data.source_name.substring(0,27)}...` : photoCardQuery.data.source_name }</Text> */}
              </Group>
              <Space h="xs"/>
            </div>
          }

          {deleteErrorContent}
          {/* {deleteError != null && <div><Text size="md" c="red" align="left">{deleteError}</Text></div>} */}
          <Group position="left" spacing="xl">
          {/* <Text c="orange" fz="xl">{photoCardQuery.data.group_name}</Text> */}
          {/* <Tooltip label={'@'+photoCardQuery.data.owner_name} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={ownerOpened}> */}
            <Avatar radius="xl" size="md" color="orange"   component={Link} to={`/profile/${photoCardQuery.data.owner_name}`} 
                // onClick={()=> {
                //   setLoginToFavOpened(false);
                //   setCardSourceOpened(false);
                //   setOwnerOpened((o)=>!o);
                // }}
              >{photoCardQuery.data.owner_name.charAt(0).toUpperCase()}</Avatar>
          {/* </Tooltip>         */}
        {currentUserQuery.status === "success" && 
                currentUserQuery.data !== null && 
                currentUserQuery.data.id !== 0 ? (
                  photoCardQuery.data.favorite_id === null ? (
                    <Flex gap="0.15rem" justify="flex-start" align="flex-end">
                      <IconHeart onClick={()=>{
                        setOwnerOpened(false);
                        setCardSourceOpened(false);
                        addFavoritePhotoCardHandler(photoCardQuery.data.id);
                      }} style={{cursor:"pointer"}} size="2rem" strokeWidth={1} color={'#868e96'}/>
                      <Text size="xs" color="dimmed">{photoCardQuery.data.favorite_cnt}</Text>
                    </Flex>
                  ) : (
                    <Flex gap="0.15rem" justify="flex-start" align="flex-end">
                      <IconHeart onClick={()=>{
                        setOwnerOpened(false);
                        setCardSourceOpened(false);
                        removeFavoritePhotoCardHandler(photoCardQuery.data.id);
                      }} style={{cursor:"pointer"}} size="2rem" strokeWidth={3} color={'#fd7e14'} fill={'#fd7e14'}/>
                      <Text size="xs" color="dimmed">{photoCardQuery.data.favorite_cnt}</Text>
                    </Flex>
                  )                                    

                ) : (
                  <Flex gap="0.15rem" justify="flex-start" align="flex-end">
                    <Tooltip label="Login to set favorites!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={loginToFavOpened}>
                      <IconHeart ml={10} size="2rem" strokeWidth={1} color={'#868e96'} onClick={()=> {
                          setOwnerOpened(false);
                          setCardSourceOpened(false);
                          setLoginToFavOpened((o)=>!o);
                          }}/>
                    </Tooltip>
                    <Text size="xs" color="dimmed">{photoCardQuery.data.favorite_cnt}</Text>
                  </Flex>
                )
        }
        {currentUsername === photoCardQuery.data.owner_name && 
                ((photoCardQuery.data.share &&
                  <IconLockOpen color={'#fd7e14'} size="2rem" onClick={()=>{
                    setOwnerOpened(false);
                    setCardSourceOpened(false);
                    updatePhotoCardShareHandler(photoCardQuery.data.id, false);
                  }}/>
                ) || (
                  <IconLock color={'#fd7e14'} size="2rem" onClick={()=>{
                    setOwnerOpened(false);
                    setCardSourceOpened(false);
                    updatePhotoCardShareHandler(photoCardQuery.data.id, true);
                  }}/>
                ))    
                }
        {currentUsername === photoCardQuery.data.owner_name && 
                  <IconTrash onClick={deletePhotoCardHandler} size="2rem" color={'#fd7e14'}/>
                }              
        </Group>
        </Container>
        </div>

      </MediaQuery>      

      
    </Container>
  );
};

PhotoCardDetail.propTypes = {
  photoCardId: PropTypes.string.isRequired,
};

export default PhotoCardDetail;
