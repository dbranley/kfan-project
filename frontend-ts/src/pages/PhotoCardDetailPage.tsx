import React from "react";
import { useParams } from "react-router-dom";
import PhotoCardDetail from "../components/PhotoCardDetail";

export default function PhotoCardDetailPage() {

    const params = useParams();

    console.log("PhotoCardDetailPage - useParams is:");
    console.log(params);
    console.log("PhotoCardDetailPage - useParams.photoCardId is:");
    console.log(params.photoCardId);

    //TODO: major hack - need to do this the right way!!
    const photoCardIdParam = params.photoCardId;
    let photoCardId = 0;
    if (typeof photoCardIdParam === 'string'){
        photoCardId = parseInt(photoCardIdParam);
    }

    return (
        <>
            <PhotoCardDetail photoCardId={photoCardId}/>
        </>
    );

}