import React from "react";

import PhotoCardGalleryGrid from "../components/PhotoCardGalleryGrid";

// const PhotoCardDetail: React.FC<{photoCardId: number}> = (props) => {
const PhotoCardsGridPage: React.FC<{myCards: boolean, 
                                    myFavorites: boolean,
                                    myFollowees: boolean
                                   }> = (props) => {

    return (
        <PhotoCardGalleryGrid myCards={props.myCards} myFavorites={props.myFavorites} myFollowees={props.myFollowees}/>
    );

}; 

export default PhotoCardsGridPage;
