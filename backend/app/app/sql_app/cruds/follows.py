
from .. import models, schemas
from databases import Database 
from sqlalchemy.sql import select, and_, or_, join
from asyncpg.exceptions import UniqueViolationError
from fastapi import HTTPException, status

from app.sql_app.database import engine, database
from app.sql_app import models

#Follows cruds
async def create_follow(database: Database, 
                       follow: schemas.FollowBase):
    print("follows.create_follow()")

    query = models.follows.insert().values(follower=follow.follower,
                                           followee=follow.followee)

    print("follows.create_follow() - about to print query")
    print(query)
    
    try:
        last_record_id = await database.execute(query)
    except UniqueViolationError as uve:
        print(uve)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Follow already exists for this 'follower' and 'followee'")
    except Exception as ex:
        print(ex)
        raise ex

    print("follows.create_follow() - after db insert - last_record_id is:")
    print(last_record_id)

    # report object with 'owner_name' empty - caller will need to fill in since that requires join query
    resp_follow = schemas.Follow(id=last_record_id,
                                 follower=follow.follower,
                                 followee=follow.followee)
    return resp_follow

async def get_follow(database: Database,
                     follower_user_id: int,
                     followee_user_id: int):
    print("crud.get_follow() - at top")
    query = models.follows.select().where(models.follows.c.follower == follower_user_id, 
                                          models.follows.c.followee == followee_user_id)
    print("crud.get_follow() - about to print query")
    print(query)
    result = await database.fetch_one(query)
    print("crud.get_follow() - after query - result is:")
    print(result)
    return result


async def get_followers(database: Database, followee_user_id: int, skip: int=0, limit: int=100):
     print("follows.get_followees() - at top")
     
     if followee_user_id is None :
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A followee user_id is required to get followees")
     
     j_comb = models.follows.join(right=models.users, \
                     onclause=and_(models.follows.c.follower == models.users.c.id,\
                                   models.follows.c.followee == followee_user_id))

     query = select([models.users.c.username.label("follower_username")]).\
                select_from(j_comb). \
                offset(skip).limit(limit).\
                order_by(models.users.c.username.desc())

     print("follows.get_followers() - about to print query")
     print(query)

     result = await database.fetch_all(query)
     print("follows.get_followers() - after query - result is:")
     print(result)     

     followers = []
     for row in result:
         followers.append(row.follower_username)
     print("follows.get_followers() - returning ="+str(len(followers))+"= followers")
     
     return followers

async def get_followees(database: Database, follower_user_id: int, skip: int=0, limit: int=100):
     print("follows.get_followees() - at top")
     
     if follower_user_id is None :
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A follower user_id is required to get followees")
     
     j_comb = models.follows.join(right=models.users, \
                     onclause=and_(models.follows.c.followee == models.users.c.id,\
                                   models.follows.c.follower == follower_user_id))

     query = select([models.users.c.username.label("followee_username")]).\
                select_from(j_comb). \
                offset(skip).limit(limit).\
                order_by(models.users.c.username.asc())

     print("follows.get_followees() - about to print query")
     print(query)

     result = await database.fetch_all(query)

     followees = []
     for row in result:
         followees.append(row.followee_username)
     print("follows.get_followees() - returning ="+str(len(followees))+"= followees")
     
     return followees


async def delete_follow(database: Database, followee: int, follower: int):

    print("follows.delete_follow()")
    query = models.follows.delete().where(models.follows.c.followee == followee, 
                                          models.follows.c.follower == follower)
    print("follows.delete_follow() - about to print query")
    print(query)

    result = await database.execute(query)
    #seems that 'result' contains the count of rows impacted
    print("cfollows.delete_follow() - after delete, about to print 'result'")
    print(result)

    return {"message":"Follow deleted"}
