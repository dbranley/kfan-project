import React, { useContext, useState } from "react";
import { Box, Button, Container, Divider, Grid, Group, Image, Stack, Text } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPhotoCard, deletePhotoCard } from "../services/photo-cards";
// import AuthContext from "../store/auth-context";
import { useNavigate } from "react-router-dom";
import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";

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

  return (
    <Grid>
      <Grid.Col span={8}>
      <Carousel withIndicators dragFree>
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
        <Text>Owner: {photoCardQuery.data.owner_name}</Text>
        <Text>
          Share?: {`${photoCardQuery.data.share ? 'Yes' : 'No'}`}
        </Text>
        <Text>
          Favorite?: {`${photoCardQuery.data.favorite_id === null ? 'No' : 'Yes'}`}
        </Text>
      </Box>
      <Divider my="xl"/>
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
