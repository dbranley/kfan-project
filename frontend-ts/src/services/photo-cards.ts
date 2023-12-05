import axios from "axios";

//PhotoCard data returned by API
type PhotoCard = {
    group_name: string,
    card_name: string,
    share: boolean,
    source_type: string,
    source_name: string,
    id: number,
    front_file_name: string,
    back_file_name: string,
    owner_name: string,
    favorite_cnt: number,
    favorite_id: number 
}

type PhotoCardUpdate = {
    id: number,
    groupName?: string,
    cardName?: string,
    share?: boolean,
    sourceName?: string,
}

// export type PhotoCard = {
//     groupName: string,
//     cardName: string,
//     share: boolean,
//     sourceType: string,
//     sourceName: string,    
//     id: number,
//     frontFileName: string,
//     backFileName: string,
//     ownerName: string,
//     favoriteCnt: number,
//     favoriteId: number 
// }

export async function getPhotoCard(id: number){

    console.log("getPhotoCard(id)");
    
    try{
        const response = await axios.get<PhotoCard>(
            '/api/photo-cards/'+id
        );
        console.log("getPhotoCard(id) - response is: ");
        console.log(response);
        
        return response.data;

        // return {
        //     groupName: response.data.group_name,
        //     cardName: response.data.card_name,
        //     share: response.data.share,
        //     sourceType: response.data.source_type,
        //     sourceName: response.data.source_name,    
        //     id: response.data.id,
        //     frontFileName: response.data.front_file_name,
        //     backFileName: response.data.back_file_name,
        //     ownerName: response.data.owner_name,
        //     favoriteCnt: response.data.favorite_cnt,
        //     favoriteId: response.data.favorite_id 
        // }

    } catch(error){
        //should I rethrow this???
        console.log(error);
        throw error;
    }       

}

export async function updatePhotoCard(photoCardData: PhotoCardUpdate){

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

export async function deletePhotoCard(photoCardId: number){

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

export async function addPhotoCardFavorite(photoCardId: number){

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

export async function removePhotoCardFavorite(photoCardId: number){

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
