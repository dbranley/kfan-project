import axios from "axios";


export async function getPhotoCards(myCards, myFavorites, myFollowees, ownerUsername){

    console.log("getPhotoCards(myCards, myFavorites, myFollowees, ownerUsername)");
    console.log(myFavorites)

    let endpoint = '/api/photo-cards?my_cards='+myCards+'&my_favorites='+myFavorites+'&my_followees='+myFollowees
    if (ownerUsername != null && ownerUsername.length > 0){
        endpoint = endpoint+'&owner_username='+ownerUsername;
    }

    try{
        const response = await axios.get(endpoint);
        console.log("getPhotoCards() - response is: ");
        console.log(response);
        return response.data;
    } catch(error){
        //should I rethrow this???
        console.log(error);
        throw error;
    }   

}

export async function getPhotoCard(id){

    console.log("getPhotoCard(id)");
    
    try{
        const response = await axios.get(
            '/api/photo-cards/'+id
        );
        console.log("getPhotoCard(id) - response is: ");
        console.log(response);
        return response.data;
    } catch(error){
        //should I rethrow this???
        console.log(error);
        throw error;
    }   

}

//  photoCardData objec is:
//    frontFile: file object from event,
//    backFile: file object from event,
//    groupName: string object from event,
//    cardName: string object from event,
//    share: boolean from event,
//    source_type: string object from event,
//    source_name: string object from event, 
export async function addPhotoCard(photoCardData){

    console.log("addPhotoCard() - photoCardData is: ");
    console.log(photoCardData);

    //TODO add validation of photoCardData object

    try{
        const response = await axios.post(
            '/api/photo-cards',
            {
                front_file: photoCardData.frontFile,
                back_file: photoCardData.backFile,
                group_name: photoCardData.groupName,
                card_name: photoCardData.cardName,
                share: photoCardData.share,
                source_type: photoCardData.sourceType,
                source_name: photoCardData.sourceName,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        if (response.status != 200){
            throw new Error('Request failed - status code='+response.status+'=, status text='+response.statusText+'=');
        }

        const data = await response.data;
        console.log("addPhotoCard() - at end - response.data is: ");
        console.log(data);
        return data;
    } catch(error){
        console.log("addPhotoCard() - got exception");
        console.log(error);
        throw error;
    }
}

export async function deletePhotoCard(photoCardId){

    console.log("deletePhotoCard() - photoCardData="+photoCardId+"=");
    console.log(photoCardId);

    try{
        const response = await axios.delete(
            '/api/photo-cards/'+photoCardId,
        );

        const status = response.status;
        console.log("deletePhotoCard() - at end - response.status is: ");
        console.log(status);
        return response;
    } catch(error){
        console.log("deletePhotoCard() - got exception");
        console.log(error);
        throw error;
    }
}

//  photoCardData objec is:
//    id: photo card id, 
//    share: boolean from event
export async function updatePhotoCard(photoCardData){

    console.log("updatePhotoCard() - photoCardData is:");
    console.log(photoCardData);

    let endpoint = '/api/photo-cards/'+photoCardData.id;

    if (photoCardData.groupName !== undefined && photoCardData.groupName !== null){
        endpoint = endpoint + '?group_name='+photoCardData.groupName;
    }

    if (photoCardData.cardName !== undefined && photoCardData.cardName !== null){
        endpoint = endpoint + '?card_name='+photoCardData.cardName;
    }

    if (photoCardData.share !== undefined && photoCardData.share !== null){
        endpoint = endpoint + '?share='+photoCardData.share;
    }

    if (photoCardData.sourceType !== undefined && photoCardData.sourceType !== null){
        endpoint = endpoint + '?source_type='+photoCardData.sourceType;
    }

    if (photoCardData.sourceName !== undefined && photoCardData.sourceName !== null){
        endpoint = endpoint + '?source_name='+photoCardData.sourceName;
    }


    try{
        const response = await axios.put(
            endpoint
        );

        const status = response.status;
        console.log("updatePhotoCard() - at end - response.status is: ");
        console.log(status);
        return response;
    } catch(error){
        console.log("updatePhotoCard() - got exception");
        console.log(error);
        throw error;
    }
}

export async function updatePhotoCardOrig(photoCardData){

    console.log("updatePhotoCard() - photoCardData="+photoCardData.id+"=, share="+photoCardData.share+"=");

    try{
        const response = await axios.put(
            '/api/photo-cards/'+photoCardData.id+'?share='+photoCardData.share,
        );

        const status = response.status;
        console.log("updatePhotoCard() - at end - response.status is: ");
        console.log(status);
        return response;
    } catch(error){
        console.log("updatePhotoCard() - got exception");
        console.log(error);
        throw error;
    }
}

export async function addPhotoCardFavorite(photoCardId){

    console.log("addPhotoCardFavorite() - photoCardData="+photoCardId+"=");
    console.log(photoCardId);

    try{
        const response = await axios.post(
            '/api/favorites?photo_card_id='+photoCardId,
        );

        const status = response.status;
        console.log("addPhotoCardFavorite() - at end - response.status is: ");
        console.log(status);
        return response;
    } catch(error){
        console.log("addPhotoCardFavorite() - got exception");
        console.log(error);
        throw error;
    }
}

export async function removePhotoCardFavorite(photoCardId){

    console.log("removePhotoCardFavorite() - photoCardData="+photoCardId+"=");
    console.log(photoCardId);

    try{
        const response = await axios.delete(
            '/api/favorites?photo_card_id='+photoCardId,
        );

        const status = response.status;
        console.log("removePhotoCardFavorite() - at end - response.status is: ");
        console.log(status);
        return response;
    } catch(error){
        console.log("removePhotoCardFavorite() - got exception");
        console.log(error);
        throw error;
    }
}