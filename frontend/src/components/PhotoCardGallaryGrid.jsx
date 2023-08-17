import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Grid, Group, Image, MediaQuery, Text } from "@mantine/core";

import PropTypes from "prop-types";

import { Link} from "react-router-dom";

import { getPhotoCards } from "../services/photo-cards";


export default function PhotoCardGallaryGrid(props) {

    // const { hovered, ref } = useHover();
    const [hovered, setHovered] = useState(false);
    const [hoveredList, setHoveredList] = useState([]);

    const queryClient = useQueryClient();

    const photoCardsQuery = useQuery({
        queryKey: ["photoCards", props.myCards],
        queryFn: () => getPhotoCards(props.myCards),
        // queryFn: () => getPhotoCard(props.photoCardId)
    });

    if (photoCardsQuery.status === "loading"){
        return <div>Loading...</div>
    }

    if (photoCardsQuery.status === "error"){
        return <div>{JSON.stringify(photoCardsQuery.error)}</div>
    }

    console.log("PhotoCardGallary - hovered is:");
    console.log(hovered);

    let newHovered = false;
    console.log(newHovered);
    console.log("PhotoCardGallary - hoveredList is:");
    console.log(hoveredList);

    //this 'cardRenderer' field no longer used, but keeping as reference
    const cardRenderer = (photoCard, index) => {
        if (hoveredList.includes(index)){
            return (
                <Card radius="md" 
                        shadow="xl" 
                        padding="sm"
                        // withBorder
                        key={index} 
                        component={Link} to="/card/101"
                        onMouseOver={()=>{
                        setHoveredList([...hoveredList, index])
                        }} 
                        onMouseLeave={()=>{
                        console.log("in onMouseLeave()")
                        setHoveredList(hoveredList.filter((item) => item != index))
                        }}
                >
             
              <Card.Section>
                  <Image 
                      src={`/api/photo-cards-${photoCard.share ? 'public' : 'private'}/${photoCard.front_file_name}`}
                      height={260} 
                  />
              </Card.Section>
              <Group position="apart" mt="md" mb="xs">
                  <Text weight={500}>{photoCard.card_name}</Text>
              </Group>
              
          </Card>
            );
        } else {
            return (
                <Card radius="md" 
                        shadow="" 
                        // withBorder
                        padding="sm"
                        key={index} 
                        component={Link} to="/card/101"
                        onMouseOver={()=>{
                        setHoveredList([...hoveredList, index])
                        }} 
                        onMouseLeave={()=>{
                        console.log("in onMouseLeave()")
                        setHoveredList(hoveredList.filter((item) => item != index))
                        }}
                >
             
              <Card.Section>
                  <Image 
                      src={`/api/photo-cards-${photoCard.share ? 'public' : 'private'}/${photoCard.front_file_name}`}
                      height={260}
                  />
              </Card.Section>
              <Group position="apart" mt="md" mb="xs">
                  <Text weight={500}>{photoCard.card_name}</Text>
              </Group>
              
          </Card>
            );
        }
    };

    return (
        <div>
            <MediaQuery smallerThan={430} styles={{ display: "none"}}>
                <Grid data-testid={`${props.myCards ? "photo-card-grid-left-mine-id" : "photo-card-grid-left-public-id"}`} justify="left" align="start">
                    {photoCardsQuery.data.map((photoCard, index) => (
                        <Grid.Col key={index} span="content" style={{width: 200}} align="left">
                        <Card radius="sm" 
                            shadow="md"
                            padding="sm"
                            key={index} 
                            component={Link} to={`/card/${photoCard.id}`}
                        >
                            <Card.Section>
                                <Image 
                                    src={`/api/photo-cards-${photoCard.share ? 'public' : 'private'}/${photoCard.front_file_name}`}
                                    height={260}
                                    // fit="contain"
                                />
                            </Card.Section>
                            <Group position="apart">
                                <Text size="sm" color="dimmed" mt="md">{photoCard.card_name.length > 20 ?
                                        `${photoCard.card_name.substring(0,20)}...` : photoCard.card_name
                                        }</Text>     
                                <Text size="sm" color="dimmed" mt="md">{`${photoCard.favorite_id === null ? '' : 'fav'}`}</Text>
                            </Group>
                            {/* <Text>Fav</Text>                   */}
                        </Card>
                        </Grid.Col>

                    ))}
                </Grid>
            </MediaQuery>
            <MediaQuery largerThan={430} styles={{ display: "none"}}>
                <Grid data-testid={`${props.myCards ? "photo-card-grid-center-mine-id" : "photo-card-grid-center-public-id"}`} justify="center" align="start">
                    {photoCardsQuery.data.map((photoCard, index) => (
                        <Grid.Col key={index} span="content" style={{width: 200}} align="left">
                        <Card radius="sm" 
                            shadow="md"
                            padding="sm"
                            key={index} 
                            component={Link} to={`/card/${photoCard.id}`}
                        >
                            <Card.Section>
                                <Image 
                                    src={`/api/photo-cards-${photoCard.share ? 'public' : 'private'}/${photoCard.front_file_name}`}
                                    height={260}
                                    // fit="contain"
                                />
                            </Card.Section>
                            <Group position="apart">
                                <Text size="sm" color="dimmed" mt="md">{photoCard.card_name.length > 20 ?
                                        `${photoCard.card_name.substring(0,20)}...` : photoCard.card_name
                                        }</Text>                       
                                <Text size="sm" color="dimmed" mt="md">{`${photoCard.favorite_id === null ? '' : 'fav'}`}</Text>
                            </Group>
                        </Card>
                        </Grid.Col>

                    ))}
                </Grid>
            </MediaQuery>            
        </div>
    );

}

PhotoCardGallaryGrid.propTypes = {
    myCards: PropTypes.bool.isRequired,
  };