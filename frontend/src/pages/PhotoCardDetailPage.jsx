import React from "react";
import { useParams } from "react-router-dom";
import PhotoCardDetail from "../components/PhotoCardDetail";

export default function PhotoCardDetailPage() {

    const params = useParams();

    console.log("PhotoCardDetailPage - useParams is:");
    console.log(params);
    console.log("PhotoCardDetailPage - useParams.photoCardId is:");
    console.log(params.photoCardId);

    return (
        <div>
            <PhotoCardDetail photoCardId={params.photoCardId}/>
        </div>
    );

}