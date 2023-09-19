
import React from "react";
import PropTypes from "prop-types";

import PhotoCardGallaryGrid from "../components/PhotoCardGallaryGrid";


export default function PhotoCardsGridPage(props) {

    return (
        <PhotoCardGallaryGrid myCards={props.myCards} myFavorites={props.myFavorites} myFollowees={props.myFollowees}/>
    );

}

PhotoCardsGridPage.propTypes = {
    myCards: PropTypes.bool.isRequired,
    myFavorites: PropTypes.bool.isRequired,
    myFollowees: PropTypes.bool.isRequired, 
  };