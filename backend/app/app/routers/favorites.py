from typing import Annotated
from fastapi import APIRouter, File, UploadFile, Form, Request, HTTPException, status
from fastapi.responses import FileResponse
import uuid

from app.sql_app import crud, schemas
from app.sql_app.database import database
from . import users

router = APIRouter()


@router.post("/api/favorites", tags=["photo_cards"], response_model=schemas.Favorite)
async def create_favorite(favorite: schemas.FavoriteBase):
    print("favorites.create_favorite() - at top")

    transaction = await database.transaction()
    try:
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

        print("favorites.read_favorites() - about to call users.get_current_user()")
        user = await users.get_current_user(token, database)
        print("favorites.read_favorites() - after calling  users.get_current_user() - user is:")
        print(user)
        if user is not None:
            user_id = user.id     
    except:
        #ignore auth exception and just leave user_id as None
        pass

    favorites = await crud.get_favorites(database, user_id=user_id, skip=skip, limit=limit)
    return favorites
