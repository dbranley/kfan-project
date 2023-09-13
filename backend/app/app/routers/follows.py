from typing import Annotated
from fastapi import APIRouter, File, UploadFile, Form, Request, HTTPException, status
from fastapi.responses import FileResponse
import uuid

from app.sql_app import crud, schemas
from app.sql_app.cruds import follows
from app.sql_app.database import database
from . import users

router = APIRouter()


@router.post("/api/followees", tags=["users"], response_model=schemas.Follow)
async def create_followee(followee_username: str,
                          request: Request):
    print("follows.create_followee() - at top")

    transaction = await database.transaction()
    try:
        #verify user is authenticated
        token = request.cookies.get("token")
        user = await users.get_current_user(token, database)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)       

        #get the user_id for the given followee username
        followee_user = await crud.get_user_by_username(database, followee_username)

        if followee_user is None:
            raise HTTPException(status_code=404, detail="Followee not found")

        # TODO - check if already exists - don't create duplicates

        # Now create the Follow object
        follow = schemas.FollowBase(follower=user.id,
                                    followee=followee_user.id)        
        resp = await follows.create_follow(database=database,
                                           follow=follow)
        
        print("follows.create_followee() - after returning from crud.create_follow() - resp is:")
        print(resp)
        

    except HTTPException as httpex:
        print("follows.create_followee() - in the except 'HTTPException' block - printing exception here: ")
        print(httpex)

        await transaction.rollback()

        #now rethrow this
        raise httpex

    except Exception as ex:
        print("follows.create_followee() - in the except 'Exception' block - printing exception here: ")
        print(ex)

        #this duplicates same code above so should do something about that
        await transaction.rollback()

        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Exception thrown while saving 'follow' - error is - " + str(ex))
    else:
        print("follows.create_followee() - in 'else' so about to commit")
        await transaction.commit()

    return resp

@database.transaction()
@router.get("/api/followees", tags=["users"], response_model=list[str])
async def read_followees(follower_username: str,
                         followee_username: str | None = None, 
                         skip: int=0, limit: int=100):

    print("follows.read_followees() - at top ")

    #get the user_id for the given follower username
    follower_user = await crud.get_user_by_username(database, follower_username)  
    if follower_user is None:
        raise HTTPException(status_code=404, detail="Follower not found")
    

    #if followee_username provided, it means we need to look for only this followee
    if followee_username is None:
        followees = await follows.get_followees(database, follower_user_id=follower_user.id, skip=skip, limit=limit)
    else:
        followee_user = await crud.get_user_by_username(database, followee_username)
        if followee_user is None:
            raise HTTPException(status_code=404, detail="Followee not found")
        follow = await follows.get_follow(database, follower_user_id=follower_user.id, followee_user_id=followee_user.id)
        print("follows.read_followees() - else-block after calling get_follow() - result is :")
        print(follow)
        if follow is None:
            followees = []
        else:
            followees = [followee_username] 


    return followees

@database.transaction()
@router.get("/api/followers", tags=["users"], response_model=list[str])
async def read_followers(followee_username: str, 
                         skip: int=0, limit: int=100):

    print("follows.read_followers() - at top ")

    #get the user_id for the given followee username
    followee_user = await crud.get_user_by_username(database, followee_username)  
    if followee_user is None:
        raise HTTPException(status_code=404, detail="Followee not found")
    
    followers = await follows.get_followers(database, followee_user_id=followee_user.id, skip=skip, limit=limit)

    return followers

@router.delete("/api/followees", tags=["users"])
async def delete_followee(followee_username: str,
                          request: Request):
    print("follows.delete_followee() - at top - followee_username="+str(followee_username)+"=")

    transaction = await database.transaction()
    try:
        #verify user is authenticated
        token = request.cookies.get("token")

        print("follows.delete_followee() - about to call users.get_current_user()")
        user = await users.get_current_user(token, database)
        print("follows.delete_followee() - after calling  users.get_current_user() - user is:")
        print(user)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)        
        
        #get the user_id for the given followee username
        followee_user = await crud.get_user_by_username(database, followee_username)  
        if followee_user is None:
            raise HTTPException(status_code=404, detail="Followee not found")        
        
        #make sure the follows exists
        follows_row = await follows.get_follow(database, follower_user_id=user.id, followee_user_id=followee_user.id)
        print("follows.delete_followee() - after calling crud follows.get_follow() - follows_row object is: ")
        print(follows_row)

        if follows_row is None:
            print("follows.delete_followee() - follows does not exist")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Follow does not exist for given user and followee username")

        #delete the favorite from DB 
        resp = await follows.delete_follow(database=database, followee=followee_user.id, follower=user.id)

    except HTTPException as httpex:
        print("follows.delete_followee() - in the except 'HTTPException' block - printing exception here: ")
        print(httpex)

        await transaction.rollback()

        #now rethrow this
        raise httpex
    
    except Exception as ex:
        print("follows.delete_followee() - in the except 'Exception' block - printing exception here: ")
        print(ex)

        #this duplicates same code above so should do something about that
        await transaction.rollback()

        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Exception thrown while deleting a 'follow' - error is - " + str(ex))
    else:
        print("follows.delete_followee() - in 'else' so about to commit")
        await transaction.commit()
    
    return resp

@router.delete("/api/followers", tags=["users"])
async def delete_follower(follower_username: str,
                          request: Request):
    print("follows.delete_follower() - at top - follower_username="+str(follower_username)+"=")

    transaction = await database.transaction()
    try:
        #verify user is authenticated
        token = request.cookies.get("token")

        print("follows.delete_follower() - about to call users.get_current_user()")
        user = await users.get_current_user(token, database)
        print("follows.delete_follower() - after calling  users.get_current_user() - user is:")
        print(user)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)        
        
        #get the user_id for the given follower username
        follower_user = await crud.get_user_by_username(database, follower_username)  
        if follower_user is None:
            raise HTTPException(status_code=404, detail="Follower not found")        
        
        #make sure the follows exists
        follows_row = await follows.get_follow(database, follower_user_id=follower_user.id, followee_user_id=user.id)
        print("follows.delete_follower() - after calling crud follows.get_follow() - follows_row object is: ")
        print(follows_row)

        if follows_row is None:
            print("follows.delete_follower() - follows_row does not exist")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Follow does not exist for given user and follower username")

        #delete the favorite from DB 
        resp = await follows.delete_follow(database=database, followee=user.id, follower=follower_user.id)

    except HTTPException as httpex:
        print("follows.delete_follower() - in the except 'HTTPException' block - printing exception here: ")
        print(httpex)

        await transaction.rollback()

        #now rethrow this
        raise httpex
    
    except Exception as ex:
        print("follows.delete_follower() - in the except 'Exception' block - printing exception here: ")
        print(ex)

        #this duplicates same code above so should do something about that
        await transaction.rollback()

        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Exception thrown while deleting a 'follow' - error is - " + str(ex))
    else:
        print("follows.delete_follower() - in 'else' so about to commit")
        await transaction.commit()
    
    return resp
