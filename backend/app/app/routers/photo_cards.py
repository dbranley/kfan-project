from typing import Annotated
from fastapi import APIRouter, File, UploadFile, Form, Request, HTTPException, status
from fastapi.responses import FileResponse
import uuid

from app.sql_app import crud, schemas
from app.sql_app.database import database
from . import users
from app.utils import save_image_file, delete_image_file, image_file_exists



router = APIRouter()


@router.post("/api/photo-cards", tags=["photo_cards"], response_model=schemas.PhotoCard)
async def create_photo_card(
                       front_file: Annotated[UploadFile, File()],
                       back_file: Annotated[UploadFile, File()],
                       group_name: Annotated[str, Form()],
                       card_name: Annotated[str, Form()],
                       share: Annotated[bool, Form()],
                       request: Request):
    print("photo_cards.create_photo_card() - at top")


    front_file_name = ''
    back_file_name = ''

    transaction = await database.transaction()
    try:
        #verify user is authenticated
        token = request.cookies.get("token")

        print("photo_cards.create_photo_card() - about to call users.get_current_user()")
        user = await users.get_current_user(token, database)
        print("photo_cards.create_photo_card() - after calling  users.get_current_user() - user is:")
        print(user)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)       

        if (users.user_authorized_to_upload(user.id) == False): 
            print("photo_cards.create_photo_card() - user is not authorized to upload photos")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)       
        

        unique_file_prefix = uuid.uuid4().hex
        front_file_name = await save_image_file(front_file, unique_file_prefix, "front")
        print("photo_cards.create_photo_card() - after saving front file - front_file_name="+front_file_name+"=")
        back_file_name = await save_image_file(back_file, unique_file_prefix, "back")
        print("photo_cards.create_photo_card() - after saving back file - back_file_name="+back_file_name+"=")

        #create schema object
        photo_card_create = schemas.PhotoCardCreate(group_name=group_name,
                                                    card_name=card_name,
                                                    share=share,
                                                    front_file_name=front_file_name,
                                                    back_file_name=back_file_name,
                                                    user_id=user.id)

        resp = await crud.create_photo_card(database=database,
                                            photo_card=photo_card_create)
        
        print("photo_cards.create_photo_card() - after returning from crud.create_photo_card() - resp is:")
        print(resp)
        
        resp.owner_name = user.username
        

    except HTTPException as httpex:
        print("photo_cards.create_photo_card() - in the except 'HTTPException' block - printing exception here: ")
        print(httpex)

        #remove the files, if created and then rollback the DB if updated
        if (len(front_file_name) > 0):
            del_front_resp = delete_image_file(front_file_name)
            print("photo_cards.create_photo_card() - response after deleting front file is:")
            print(del_front_resp)

        if (len(back_file_name) > 0):
            del_back_resp = delete_image_file(back_file_name)
            print("photo_cards.create_photo_card() - response after deleting back file is:")
            print(del_back_resp)

        await transaction.rollback()

        #now rethrow this
        raise httpex
    
    except Exception as ex:
        print("photo_cards.create_photo_card() - in the except 'Exception' block - printing exception here: ")
        print(ex)

        #this duplicates same code above so should do something about that
        if (len(front_file_name) > 0):
            del_front_resp = delete_image_file(front_file_name)

        if (len(back_file_name) > 0):
            del_back_resp = delete_image_file(back_file_name)

        await transaction.rollback()

        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Exception thrown while saving photo card - error is - " + str(ex))
    else:
        print("create_photo_card() - in 'else' so about to commit")
        await transaction.commit()

    return resp

@database.transaction()
@router.get("/api/photo-cards", tags=["photo_cards"], response_model=list[schemas.PhotoCard])
async def read_photo_cards(request: Request, my_cards: bool=False, skip: int=0, limit: int=100):

    print("photo_cards.read_photo_cards() - at top - my_cards is:")
    print(my_cards)
    #if user is logged in, then get their user_id to pass to get query
    #-but default to 0, which assumes no user id available
    user_id = 0
    try:

        token = request.cookies.get("token")

        print("photo_cards.read_photo_cards() - about to call users.get_current_user()")
        user = await users.get_current_user(token, database)
        print("photo_cards.read_photo_cards() - after calling  users.get_current_user() - user is:")
        print(user)
        if user is not None:
            user_id = user.id     
    except:
        #ignore auth exception and just leave user_id as None
        pass

    if my_cards == True and user_id == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Must login to view just your photo cards")

    photo_cards = await crud.get_photo_cards(database, my_cards=my_cards, user_id=user_id, skip=skip, limit=limit)
    return photo_cards

@database.transaction()
@router.get("/api/photo-cards/{id}", tags=["photo_cards"], response_model=schemas.PhotoCard)
async def read_photo_cards(id: int):

    db_photo_card = await crud.get_photo_card(database, photo_card_id=id)

    if db_photo_card is None:
        raise HTTPException(status_code=404, detail="Photo card not found")
    return db_photo_card

@router.delete("/api/photo-cards/{id}", tags=["photo_cards"])
async def delete_photo_card(id: int,
                            request: Request):
    print("photo_cards.delete_photo_card() - at top - id="+str(id)+"=")



    transaction = await database.transaction()
    try:
        #verify user is authenticated
        token = request.cookies.get("token")

        print("photo_cards.delete_photo_card() - about to call users.get_current_user()")
        user = await users.get_current_user(token, database)
        print("photo_cards.delete_photo_card() - after calling  users.get_current_user() - user is:")
        print(user)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)        
        
        photo_card = await crud.get_photo_card(database, id)
        print("photo_cards.delete_photo_card() - after calling crud.get_photo_card() - photo_card object is: ")
        print(photo_card)

        if photo_card is None:
            print("photo_cards.delete_photo_card() - photo card does not exist")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Photo card does not exist")
        
        #now make sure that only the 'owner' of the photo is deleting it
        if photo_card.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Only owner of photo can delete it")

        #delete the photo card from DB first - since we cannot rollback file deletes
        resp = await crud.delete_photo_card(database=database, photo_card_id=id, user_id=user.id)

        #now delete the image files
        await delete_image_file(photo_card.front_file_name)
        await delete_image_file(photo_card.back_file_name)


    except HTTPException as httpex:
        print("photo_cards.create_photo_card() - in the except 'HTTPException' block - printing exception here: ")
        print(httpex)

        await transaction.rollback()
        #can't really un-delete the actual files 

        #now rethrow this
        raise httpex
    
    except Exception as ex:
        print("photo_cards.create_photo_card() - in the except 'Exception' block - printing exception here: ")
        print(ex)

        #this duplicates same code above so should do something about that
        await transaction.rollback()

        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Exception thrown while saving photo card - error is - " + str(ex))
    else:
        print("create_photo_card() - in 'else' so about to commit")
        await transaction.commit()
    
    return resp

@database.transaction()
@router.get("/api/photo-cards-public/{file_name}", tags=["photo_cards"])
async def get_photo_card_public(file_name: str):
    print("photo_cards.get_photo_card_public() - at top")
    print("photo_cards.get_photo_card_public() - file_name ="+file_name+"=")

    file_name_for_query = file_name
    index_of_identifier = file_name_for_query.find("_front")
    if (index_of_identifier == -1):
        file_name_for_query = file_name_for_query.replace("_back", "_front")
    print("get_photo_card_public() - file_name_for_query="+file_name_for_query+"=")
    is_shared = await crud.is_photo_card_shared(database, front_file_name=file_name_for_query)

    if (is_shared is None):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo card file does not exist")
    
    if (not is_shared):
        raise HTTPException(status_code=401, detail="Not authorized to retrieve file")

    #Now make sure image exists locally and if not let it get fetched from Cloud
    if (not image_file_exists(file_name)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo card file does not exist")

    file_path = 'app/images/'+file_name
    return FileResponse(file_path)

@database.transaction()
@router.get("/api/photo-cards-private/{file_name}", tags=["photo_cards"])
async def get_photo_card_private(file_name: str, request: Request):
    print("photo_cards.get_photo_card_private() - at top")
    print("photo_cards.get_photo_card_private() - file_name ="+file_name+"=")

    #verify user is authenticated
    token = request.cookies.get("token")

    print("photo_cards.get_photo_card_private() - about to call users.get_current_user()")
    user = await users.get_current_user(token, database)
    print("photo_cards.get_photo_card_private() - after calling  users.get_current_user() - user is:")
    print(user)
    if user is None:
        #Actually will never get here if user not logged in because 'users.get_current_user()' throws HTTP_401 exception
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized to retrieve file")       

    if (not image_file_exists(file_name)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo card file does not exist")
    
    file_path = 'app/images/'+file_name
    return FileResponse(file_path)