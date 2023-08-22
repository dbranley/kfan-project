import React, { useContext, useState } from "react";
import { Avatar, 
         Box, 
         Button, 
         Container, 
         Divider, 
         Grid, 
         Group, 
         Image, 
         Stack, 
         Text, 
         Tooltip } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPhotoCard, 
         deletePhotoCard, 
         addPhotoCardFavorite, 
         removePhotoCardFavorite } from "../services/photo-cards";
// import AuthContext from "../store/auth-context";
import { useNavigate } from "react-router-dom";
import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";
import { IconHeart } from "@tabler/icons-react";

const PhotoCardDetail = (props) => {

  // const authCtx = useContext(AuthContext);

  const [deleteError, setDeleteError] = useState(null);

  const navigate = useNavigate();

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
          setDeleteError("Upload failed with '"+error.message+"'");
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
    <Grid>
      <Grid.Col span={8}>
      <Carousel withIndicators dragFree loop>
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
      </Grid.Col>
      <Grid.Col span={4}>
      <Stack align="flex-start" justify="space-evenly">
      <Box >
        <Text size="xl" fw={700} c="brown">{photoCardQuery.data.card_name}</Text>
        <Divider my="sm"/>
        <Text>Group: {photoCardQuery.data.group_name}</Text>
        {/* <Text>Owner: {photoCardQuery.data.owner_name}</Text> */}
        <Text>
          Share?: {`${photoCardQuery.data.share ? 'Yes' : 'No'}`}
        </Text>
      </Box>

      
      <Container fluid ml="0rem">
        <Group>
        <Tooltip label={'@'+photoCardQuery.data.owner_name} color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
          <Avatar radius="xl" size="md" color="orange">{photoCardQuery.data.owner_name.charAt(0).toUpperCase()}</Avatar>
        </Tooltip>        
      {currentUserQuery.status === "success" && 
              currentUserQuery.data !== null && 
              currentUserQuery.data.id !== 0 ? (
                photoCardQuery.data.favorite_id === null ? (
                  <IconHeart onClick={()=>addFavoritePhotoCardHandler(photoCardQuery.data.id)} style={{cursor:"pointer"}} size="2rem" strokeWidth={1} color={'#868e96'}/>
                ) : (
                  <IconHeart onClick={()=>removeFavoritePhotoCardHandler(photoCardQuery.data.id)} style={{cursor:"pointer"}} size="2rem" strokeWidth={3} color={'#fd7e14'} fill={'#fd7e14'}/>
                )                                    

              ) : (
                <Tooltip label="Login to set favorites!" color="orange.5" withArrow openDelay={500} radius="sm" fz="sm">
                  <IconHeart ml={10} size="2rem" strokeWidth={1} color={'#868e96'}/>
                </Tooltip>
              )
      }
      </Group>
      </Container>
      <Divider my="xs"/>
      {deleteError != null && <div><Text size="md" c="red" align="left">{deleteError}</Text></div>}
      {currentUserQuery.status === "success" && 
              currentUserQuery.data !== null && 
              currentUserQuery.data.id !== 0 &&
              currentUserQuery.data.id === photoCardQuery.data.user_id &&  
              <Button onClick={deletePhotoCardHandler}>Delete</Button>}
      </Stack>
      </Grid.Col>

    </Grid>
  );
};

PhotoCardDetail.propTypes = {
  photoCardId: PropTypes.string.isRequired,
};

export default PhotoCardDetail;
