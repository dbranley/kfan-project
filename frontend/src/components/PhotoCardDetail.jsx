import React, { useEffect, useState } from "react";
import { Avatar, 
         Container, 
         Divider, 
         Group, 
         Image, 
         MediaQuery, 
         Space, 
         Text, 
         Tooltip } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";
import { IconHeart, 
         IconTrash, 
         IconLock, 
         IconLockOpen, 
         IconArrowBigLeft } from "@tabler/icons-react";

import { getPhotoCard, 
         deletePhotoCard, 
         updatePhotoCard,
         addPhotoCardFavorite, 
         removePhotoCardFavorite} from "../services/photo-cards";

import { extractMessageFromRestError } from "../utils";

const PhotoCardDetail = (props) => {

  const [deleteError, setDeleteError] = useState(null);
  const [ownerOpened, setOwnerOpened] = useState(false);
  const [loginToFavOpened, setLoginToFavOpened] = useState(false);

  const navigate = useNavigate();

  //doing this will force focus to top of page on 1st render of this detail page
  useEffect(() => {
    window.scrollTo(0,0);
  }, []);

  const photoCardQuery = useQuery({
    queryKey: ["photoCards", props.photoCardId],
    queryFn: () => getPhotoCard(props.photoCardId),
  });

  const queryClient = useQueryClient();

  const currentUserQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: SESSION_EXPIRATION_TIME
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

  const updatePhotoCardHandler = async(photoCardId, share) => {
    console.log("PhotoCardDetails - updatePhotoCardHandler() - share is:");
    console.log(share);
    console.log("PhotoCardDetails - updatePhotoCardHandler() - about to call update mutation")
    updatePhotoCardMutation.mutate({
      id : photoCardId,
      share : share 
    }); //, share);
  };

  if (photoCardQuery.status === "loading") {
    return <div>Loading...</div>;
  }

  if (photoCardQuery.status === "error") {
    return <div>{JSON.stringify(photoCardQuery.error)}</div>;
  }

  console.log("PhotoCardDetail - photoCardQuery.data is: ");
  console.log(photoCardQuery.data);


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

  return (
    <Container>
      <Group>
        <IconArrowBigLeft size="2rem" fill={'#d9480f'} color={'#d9480f'} onClick={() => navigate(-1)}/>
        <Text size="xl" fw={700} c="brown">{photoCardQuery.data.card_name}</Text>
      </Group>
      {/* <Divider my="sm"/> */}
      <MediaQuery smallerThan={430} styles={{ display: "none"}}>
        {/* <Carousel withIndicators dragFree controlsOffset="xl" controlSize={40} slideSize="49%" */}
        <div>
        <Carousel draggable={false} withControls={false} slideGap="xs" slideSize="50%" withIndicators={false} align="start">
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
          <Text c="orange" fz="xl">{photoCardQuery.data.group_name}</Text>
          <Space h="sm"/>
          {deleteError != null && <div><Text size="md" c="red" align="left">{deleteError}</Text></div>}
          <Group position="left" spacing="xl">
          {/* <Text c="orange" fz="xl">{photoCardQuery.data.group_name}</Text> */}
          <Tooltip label={'@'+photoCardQuery.data.owner_name} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
            <Avatar radius="xl" size="md" color="orange">{photoCardQuery.data.owner_name.charAt(0).toUpperCase()}</Avatar>
          </Tooltip>        
        {currentUserQuery.status === "success" && 
                currentUserQuery.data !== null && 
                currentUserQuery.data.id !== 0 ? (
                  photoCardQuery.data.favorite_id === null ? (
                    <IconHeart onClick={()=>{
                      addFavoritePhotoCardHandler(photoCardQuery.data.id);
                    }} style={{cursor:"pointer"}} size="2rem" strokeWidth={1} color={'#868e96'}/>
                  ) : (
                    <IconHeart onClick={()=>{
                      removeFavoritePhotoCardHandler(photoCardQuery.data.id);
                    }} style={{cursor:"pointer"}} size="2rem" strokeWidth={3} color={'#fd7e14'} fill={'#fd7e14'}/>
                  )                                    

                ) : (
                  <Tooltip label="Login to set favorites!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                    <IconHeart ml={10} size="2rem" strokeWidth={1} color={'#868e96'} />
                  </Tooltip>
                )
        }
        {currentUserQuery.status === "success" && 
                currentUserQuery.data !== null && 
                currentUserQuery.data.id !== 0 &&
                currentUserQuery.data.id === photoCardQuery.data.user_id &&
                ((photoCardQuery.data.share &&
                  <IconLockOpen color={'#fd7e14'} size="2rem" onClick={()=>{
                    updatePhotoCardHandler(photoCardQuery.data.id, false);
                  }}/>
                ) || (
                  <IconLock color={'#fd7e14'} size="2rem" onClick={()=>{
                    updatePhotoCardHandler(photoCardQuery.data.id, true);
                  }}/>
                ))    
                }
        {currentUserQuery.status === "success" && 
                currentUserQuery.data !== null && 
                currentUserQuery.data.id !== 0 &&
                currentUserQuery.data.id === photoCardQuery.data.user_id &&  
                  <IconTrash onClick={deletePhotoCardHandler} size="2rem" color={'#fd7e14'}/>
                }              
        </Group>
        </Container>   
        </div>     
      </MediaQuery>
      <MediaQuery largerThan={430} styles={{ display: "none"}}>
        {/* <Space h="xs"/> */}
        <div>
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
                height={400}
                fit="contain"
              />
            </Carousel.Slide>
            <Carousel.Slide>
              <Image
                src={`/api/photo-cards-${
                  photoCardQuery.data.share ? "public" : "private"
                }/${photoCardQuery.data.back_file_name}`}
                height={400}
                fit="contain"
              />
            </Carousel.Slide>
          </Carousel>
          <Container fluid ml="0rem" mt="0.5rem">
          <Text c="orange" fz="xl">{photoCardQuery.data.group_name}</Text>
          <Space h="sm"/>
          {deleteError != null && <div><Text size="md" c="red" align="left">{deleteError}</Text></div>}
          <Group position="left" spacing="xl">
          {/* <Text c="orange" fz="xl">{photoCardQuery.data.group_name}</Text> */}
          <Tooltip label={'@'+photoCardQuery.data.owner_name} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={ownerOpened}>
            <Avatar radius="xl" size="md" color="orange" onClick={()=> {
              setLoginToFavOpened(false);
              setOwnerOpened((o)=>!o);
              }}>{photoCardQuery.data.owner_name.charAt(0).toUpperCase()}</Avatar>
          </Tooltip>        
        {currentUserQuery.status === "success" && 
                currentUserQuery.data !== null && 
                currentUserQuery.data.id !== 0 ? (
                  photoCardQuery.data.favorite_id === null ? (
                    <IconHeart onClick={()=>{
                      setOwnerOpened(false);
                      addFavoritePhotoCardHandler(photoCardQuery.data.id);
                    }} style={{cursor:"pointer"}} size="2rem" strokeWidth={1} color={'#868e96'}/>
                  ) : (
                    <IconHeart onClick={()=>{
                      setOwnerOpened(false);
                      removeFavoritePhotoCardHandler(photoCardQuery.data.id);
                    }} style={{cursor:"pointer"}} size="2rem" strokeWidth={3} color={'#fd7e14'} fill={'#fd7e14'}/>
                  )                                    

                ) : (
                  <Tooltip label="Login to set favorites!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm" opened={loginToFavOpened}>
                    <IconHeart ml={10} size="2rem" strokeWidth={1} color={'#868e96'} onClick={()=> {
                        setOwnerOpened(false);
                        setLoginToFavOpened((o)=>!o);
                        }}/>
                  </Tooltip>
                )
        }
        {currentUserQuery.status === "success" && 
                currentUserQuery.data !== null && 
                currentUserQuery.data.id !== 0 &&
                currentUserQuery.data.id === photoCardQuery.data.user_id &&
                ((photoCardQuery.data.share &&
                  <IconLockOpen color={'#fd7e14'} size="2rem" onClick={()=>{
                    setOwnerOpened(false);
                    updatePhotoCardHandler(photoCardQuery.data.id, false);
                  }}/>
                ) || (
                  <IconLock color={'#fd7e14'} size="2rem" onClick={()=>{
                    setOwnerOpened(false);
                    updatePhotoCardHandler(photoCardQuery.data.id, true);
                  }}/>
                ))    
                }
        {currentUserQuery.status === "success" && 
                currentUserQuery.data !== null && 
                currentUserQuery.data.id !== 0 &&
                currentUserQuery.data.id === photoCardQuery.data.user_id &&  
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
