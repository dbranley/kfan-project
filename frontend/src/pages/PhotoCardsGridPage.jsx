
import React from "react";
import PropTypes from "prop-types";

import PhotoCardGallaryGrid from "../components/PhotoCardGallaryGrid";


export default function PhotoCardsGridPage(props) {

    return (
        <PhotoCardGallaryGrid myCards={props.myCards}/>
    );

}

PhotoCardsGridPage.propTypes = {
    myCards: PropTypes.bool.isRequired,
  };