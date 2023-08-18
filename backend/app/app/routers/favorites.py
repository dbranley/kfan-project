from typing import Annotated
from fastapi import APIRouter, File, UploadFile, Form, Request, HTTPException, status
from fastapi.responses import FileResponse
import uuid

from app.sql_app import crud, schemas
from app.sql_app.database import database
from . import users

router = APIRouter()


@router.post("/api/favorites", tags=["photo_cards"], response_model=schemas.Favorite)
async def create_favorite(photo_card_id: int,
                          request: Request):
    print("favorites.create_favorite() - at top")

    transaction = await database.transaction()
    try:
        #verify user is authenticated
        token = request.cookies.get("token")
        user = await users.get_current_user(token, database)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)       

        #now make sure this is a valid photo_card_id
        db_photo_card = await crud.get_photo_card(database, photo_card_id=photo_card_id)

        if db_photo_card is None:
            raise HTTPException(status_code=404, detail="Photo card not found")

        #if photo_card not owned by current user, then make sure it is public
        if db_photo_card.user_id != user.id:
            if db_photo_card.share is False:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Photo card is private")

        # TODO - check if already exists - don't create duplicates
        # TODO - create new unique constraint on Favorites table - user_id + photo_id

        # Now create the FavoriteBase object
        favorite = schemas.FavoriteBase(user_id=user.id,
                                        photo_card_id=photo_card_id)        
        resp = await crud.create_favorite(database=database,
                                          favorite=favorite)
        
        print("favorites.create_favorite() - after returning from crud.create_favorite() - resp is:")
        print(resp)
        

    except HTTPException as httpex:
        print("favorites.create_favorite() - in the except 'HTTPException' block - printing exception here: ")
        print(httpex)

        await transaction.rollback()

        #now rethrow this
        raise httpex

    except Exception as ex:
        print("favorites.create_favorite() - in the except 'Exception' block - printing exception here: ")
        print(ex)

        #this duplicates same code above so should do something about that
        await transaction.rollback()

        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Exception thrown while saving favorite - error is - " + str(ex))
    else:
        print("favorites.create_favorite() - in 'else' so about to commit")
        await transaction.commit()

    return resp

@database.transaction()
@router.get("/api/favorites", tags=["photo_cards"], response_model=list[schemas.Favorite])
async def read_favorites(request: Request, skip: int=0, limit: int=100):

    print("favorites.read_favorites() - at top ")
    user_id = None
    #if user is logged in, then get their user_id to pass to get query
    #-but default to 0, which assumes no user id available
    try:
        token = request.cookies.get("token")
        user = await users.get_current_user(token, database)
        if user is not None:
            user_id = user.id     
    except:
        #ignore auth exception and just leave user_id as None
        pass

    favorites = await crud.get_favorites(database, user_id=user_id, skip=skip, limit=limit)

    return favorites

@router.delete("/api/favorites", tags=["photo_cards"])
async def delete_favorite(photo_card_id: int,
                          request: Request):
    print("favorites.delete_favorite() - at top - photo_card_id="+str(id)+"=")

    transaction = await database.transaction()
    try:
        #verify user is authenticated
        token = request.cookies.get("token")

        print("favorites.delete_favorite() - about to call users.get_current_user()")
        user = await users.get_current_user(token, database)
        print("favorites.delete_favorite() - after calling  users.get_current_user() - user is:")
        print(user)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)        
        
        #make sure the favorite exists
        favorite = await crud.get_favorite(database, photo_card_id=photo_card_id, user_id=user.id)
        print("favorites.delete_favorite() - after calling crud.get_favorite() - favorite object is: ")
        print(favorite)

        if favorite is None:
            print("favorites.delete_favorite() - favorite does not exist")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Favorite does not exist for given user and photo card")

        #delete the favorite from DB 
        resp = await crud.delete_favorite(database=database, favorite_id=favorite.id)

    except HTTPException as httpex:
        print("favorites.delete_favorite() - in the except 'HTTPException' block - printing exception here: ")
        print(httpex)

        await transaction.rollback()

        #now rethrow this
        raise httpex
    
    except Exception as ex:
        print("favorites.delete_favorite() - in the except 'Exception' block - printing exception here: ")
        print(ex)

        #this duplicates same code above so should do something about that
        await transaction.rollback()

        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Exception thrown while deleting a 'favorite' - error is - " + str(ex))
    else:
        print("favorites.delete_favorite() - in 'else' so about to commit")
        await transaction.commit()
    
    return resp