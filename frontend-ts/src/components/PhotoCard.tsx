import React from "react";

import { PhotoCard } from "../services/photo-cards";


const PhotoCard: React.FC<{photoCard: PhotoCard, 
                           index: number,
                           myCard: boolean,
                           cardHeight: number
                        }> = (props) => {

    return <div>PhotoCard</div>
};

export default PhotoCard;