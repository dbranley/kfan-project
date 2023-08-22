import axios from "axios";


export async function getPhotoCards(myCards, myFavorites, collectorId){

    console.log("getPhotoCards(myCards, myFavorites, collectorId)");
    console.log(myFavorites)

    try{
        const response = await axios.get(
            '/api/photo-cards?my_cards='+myCards+'&my_favorites='+myFavorites+'&collector_id='+collectorId
        );
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
//    share: boolean from event
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