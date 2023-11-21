import axios from "axios";

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