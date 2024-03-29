
from . import models, schemas
from databases import Database 
from sqlalchemy.sql import select, and_, or_, text, join, func, table
from asyncpg.exceptions import UniqueViolationError
from fastapi import HTTPException, status

from app.sql_app.database import engine, database

#Users cruds
async def create_user(database: Database,
                      user: schemas.UserCreate):
    print("crud.create_user()")
    
    query = models.users.insert().values(username=user.username, password=user.password, email=user.email, upload=False)
    
    last_record_id = await database.execute(query)

    return {"id": last_record_id, "username": user.username, "email": user.email, "upload": False}

async def update_user_pwd(database: Database, 
                          user_id: int,
                          new_password: str):
    print("crud.update_user_pwd() - at top")

    query = models.users.update().where(models.users.c.id == user_id) \
                                    .values(password = new_password)
    
    result = await database.execute(query)

    return {"message":"User updated"}    

async def get_user(database: Database,
             user_id: int):
    print("crud.get_user() - at top")
    query = models.users.select().where(models.users.c.id == user_id)
    result = await database.fetch_one(query)
    return result

async def get_user_by_username(database: Database,
                         username: str):
       print("crud.get_user_by_username")
       query = models.users.select().where(models.users.c.username == username)
       return await database.fetch_one(query)

#PhotoCards cruds
async def create_photo_card(database: Database, 
                       photo_card: schemas.PhotoCardCreate):
    print("crud.create_photo_card()")

    query = models.photo_cards.insert().values(front_file_name=photo_card.front_file_name,
                                               back_file_name=photo_card.back_file_name,
                                               group_name=photo_card.group_name,
                                               card_name=photo_card.card_name,
                                               share=photo_card.share,
                                               source_type=photo_card.source_type,
                                               source_name=photo_card.source_name,
                                               user_id=photo_card.user_id)

    print("crud.create_photo_card() - about to print query")
    print(query)
    
    last_record_id = await database.execute(query)

    print("crud.create_photo_card() - after db insert - last_record_id is:")
    print(last_record_id)

    # report object with 'owner_name' empty - caller will need to fill in since that requires join query
    resp_photo_card = schemas.PhotoCard(id=last_record_id,
                                        group_name=photo_card.group_name,
                                        card_name=photo_card.card_name,
                                        share=photo_card.share,
                                        source_type=photo_card.source_type,
                                        source_name=photo_card.source_name,
                                        front_file_name=photo_card.front_file_name,
                                        back_file_name=photo_card.back_file_name,
                                        user_id=photo_card.user_id,
                                        owner_name='')
    return resp_photo_card

async def update_photo_card(database: Database, 
                            photo_card_id: int,
                            group_name: str,
                            card_name: str,
                            source_type: str,
                            source_name: str,
                            share: bool):
    print("crud.update_photo_card()")

    query = models.photo_cards.update().where(models.photo_cards.c.id == photo_card_id) \
                                       .values(group_name=group_name,
                                               card_name=card_name,
                                               share=share,
                                               source_type=source_type,
                                               source_name=source_name)

   
    result = await database.execute(query)

    return {"message":"Photo Card updated"}

async def update_photo_card_orig(database: Database, 
                            photo_card_id: int,
                            share: bool):
    print("crud.update_photo_card()")

    query = models.photo_cards.update().where(models.photo_cards.c.id == photo_card_id) \
                                       .values(share = share)

   
    result = await database.execute(query)

    return {"message":"Photo Card updated"}

async def get_photo_cards(database: Database, user_id: int, my_cards: bool, collector_id: int, skip: int=0, limit: int=100):
     print("crud.get_photo_cards() - at top")
     
     params = {
         "user_id": user_id,
         "param_1": limit,
         "param_2": skip
     }

     if my_cards:
        s = """
            SELECT photo_cards.id, 
                photo_cards.front_file_name, 
                photo_cards.back_file_name, 
                photo_cards.group_name, 
                photo_cards.card_name, 
                photo_cards.share, 
                photo_cards.source_type, 
                photo_cards.source_name, 
                photo_cards.user_id, 
                users.username AS owner_name, 
                favorites.id AS favorite_id,
                (SELECT count(id) from favorites where photo_card_id = photo_cards.id) AS favorite_cnt  
            FROM photo_cards JOIN users ON photo_cards.user_id = users.id AND photo_cards.user_id = :user_id 
            LEFT OUTER JOIN favorites ON photo_cards.id = favorites.photo_card_id AND favorites.user_id = :user_id 
            ORDER BY photo_cards.id DESC LIMIT :param_1 OFFSET :param_2
            """       
     
     #collector_id == 0 means 'NO' filter on owner of the card
     elif collector_id == 0:
        s = """
            SELECT photo_cards.id, 
                photo_cards.front_file_name, 
                photo_cards.back_file_name, 
                photo_cards.group_name, 
                photo_cards.card_name, 
                photo_cards.share, 
                photo_cards.source_type, 
                photo_cards.source_name, 
                photo_cards.user_id, 
                users.username AS owner_name, 
                favorites.id AS favorite_id,
                (SELECT count(id) from favorites where photo_card_id = photo_cards.id) AS favorite_cnt 
            FROM photo_cards JOIN users ON photo_cards.user_id = users.id 
                AND (photo_cards.share = true OR photo_cards.user_id = :user_id) 
            LEFT OUTER JOIN favorites ON photo_cards.id = favorites.photo_card_id AND favorites.user_id = :user_id 
            ORDER BY photo_cards.id DESC LIMIT :param_1 OFFSET :param_2
            """
    
     #collector_id != 0 means we need to filter on owner of the card
     else: 
        params['collector_id'] = collector_id

        s = """
            SELECT photo_cards.id, 
                photo_cards.front_file_name, 
                photo_cards.back_file_name, 
                photo_cards.group_name, 
                photo_cards.card_name, 
                photo_cards.share, 
                photo_cards.source_type, 
                photo_cards.source_name, 
                photo_cards.user_id, 
                users.username AS owner_name, 
                favorites.id AS favorite_id,
                (SELECT count(id) from favorites where photo_card_id = photo_cards.id) AS favorite_cnt 
            FROM photo_cards JOIN users ON photo_cards.user_id = users.id AND photo_cards.user_id = :collector_id 
                AND (photo_cards.share = true OR photo_cards.user_id = :user_id) 
            LEFT OUTER JOIN favorites ON photo_cards.id = favorites.photo_card_id AND favorites.user_id = :user_id 
            ORDER BY photo_cards.id DESC LIMIT :param_1 OFFSET :param_2
            """
     print("crud.get_photo_cards() - about to print the statement")
     print(s)    
     result = await database.fetch_all(query=s, values=params)

     print("crud.get_photo_cards() - after query - result is:")
     print(result)     
     return result

async def get_my_followees_photo_cards(database: Database, user_id: int, skip: int=0, limit: int=100):
     print("crud.get_my_favorite_photo_cards() - at top")
       
     s="""
        SELECT photo_cards.id, 
            photo_cards.front_file_name, 
            photo_cards.back_file_name, 
            photo_cards.group_name, 
            photo_cards.card_name, 
            photo_cards.share, 
            photo_cards.source_type, 
            photo_cards.source_name, 
            photo_cards.user_id, 
            users.username AS owner_name, 
            favorites.id AS favorite_id,
            (SELECT count(id) from favorites where photo_card_id = photo_cards.id) AS favorite_cnt 
        FROM photo_cards JOIN users ON photo_cards.user_id = users.id 
         AND photo_cards.share = true 
         AND photo_cards.user_id IN (SELECT follows.followee FROM follows WHERE follows.follower = :user_id) 
        LEFT OUTER JOIN favorites ON photo_cards.id = favorites.photo_card_id AND favorites.user_id = :user_id 
        ORDER BY photo_cards.id DESC LIMIT :param_1 OFFSET :param_2       
       """
     
     print("crud.get_my_followees_photo_cards() - about to print the statement")
     print(s)    
     result = await database.fetch_all(query=s, values={"user_id": user_id, "param_1": limit, "param_2":skip})
     
     print("crud.get_my_followees_photo_cards - after query - result is:")
     print(result)     
     return result

async def get_my_favorite_photo_cards(database: Database, user_id: int, my_cards: bool, collector_id: int, skip: int=0, limit: int=100):
     print("crud.get_my_favorite_photo_cards() - at top")
     
     params = {
        "user_id": user_id,
        "param_1": limit,
        "param_2": skip
     }
     if my_cards:
        s = """
            SELECT photo_cards.id, 
                photo_cards.front_file_name, 
                photo_cards.back_file_name, 
                photo_cards.group_name, 
                photo_cards.card_name, 
                photo_cards.share, 
                photo_cards.source_type, 
                photo_cards.source_name, 
                photo_cards.user_id, 
                users.username AS owner_name, 
                favorites.id AS favorite_id,
                (SELECT count(id) from favorites where photo_card_id = photo_cards.id) AS favorite_cnt  
            FROM photo_cards JOIN users ON photo_cards.user_id = users.id 
            AND photo_cards.user_id = :user_id 
            JOIN favorites ON photo_cards.id = favorites.photo_card_id AND favorites.user_id = :user_id 
            ORDER BY photo_cards.id DESC LIMIT :param_1 OFFSET :param_2
            """
        j_comb = models.photo_cards.join(right=models.users, \
                      onclause=and_(models.photo_cards.c.user_id == models.users.c.id,\
                                    models.photo_cards.c.user_id == user_id)). \
                      join(right=models.favorites,  \
                            onclause=and_(models.photo_cards.c.id == models.favorites.c.photo_card_id, \
                                    models.favorites.c.user_id == user_id))        

     #collector_id == 0 means 'NO' filter on owner of the card
     elif collector_id == 0:
        s = """
            SELECT photo_cards.id, 
                photo_cards.front_file_name, 
                photo_cards.back_file_name, 
                photo_cards.group_name, 
                photo_cards.card_name, 
                photo_cards.share, 
                photo_cards.source_type, 
                photo_cards.source_name, 
                photo_cards.user_id, 
                users.username AS owner_name, 
                favorites.id AS favorite_id,
                (SELECT count(id) from favorites where photo_card_id = photo_cards.id) AS favorite_cnt 
            FROM photo_cards JOIN users ON photo_cards.user_id = users.id 
            AND (photo_cards.share = true OR photo_cards.user_id = :user_id) 
            JOIN favorites ON photo_cards.id = favorites.photo_card_id AND favorites.user_id = :user_id 
            ORDER BY photo_cards.id DESC LIMIT :param_1 OFFSET :param_2
            """
        j_comb = models.photo_cards.join(right=models.users, \
                      onclause=and_(models.photo_cards.c.user_id == models.users.c.id,\
                          or_(models.photo_cards.c.share == True, models.photo_cards.c.user_id == user_id))). \
                      join(right=models.favorites,  \
                            onclause=and_(models.photo_cards.c.id == models.favorites.c.photo_card_id, \
                                    models.favorites.c.user_id == user_id))
     
     #collector_id != 0 means we need to filter on owner of the card
     else: 
        s = """
            SELECT photo_cards.id, 
                photo_cards.front_file_name, 
                photo_cards.back_file_name, 
                photo_cards.group_name, 
                photo_cards.card_name, 
                photo_cards.share, 
                photo_cards.source_type, 
                photo_cards.source_name, 
                photo_cards.user_id, 
                users.username AS owner_name, 
                favorites.id AS favorite_id,
                (SELECT count(id) from favorites where photo_card_id = photo_cards.id) AS favorite_cnt 
            FROM photo_cards JOIN users ON photo_cards.user_id = users.id 
            AND photo_cards.user_id = :collector_id
            AND (photo_cards.share = true OR photo_cards.user_id = :user_id) 
            JOIN favorites ON photo_cards.id = favorites.photo_card_id AND favorites.user_id = :user_id 
            ORDER BY photo_cards.id DESC LIMIT :param_1 OFFSET :param_2
            """
        params['collector_id'] = collector_id
        j_comb = models.photo_cards.join(right=models.users, \
                      onclause=and_(models.photo_cards.c.user_id == models.users.c.id,\
                                    models.photo_cards.c.user_id == collector_id, \
                          or_(models.photo_cards.c.share == True, models.photo_cards.c.user_id == user_id))). \
                      join(right=models.favorites,  \
                            onclause=and_(models.photo_cards.c.id == models.favorites.c.photo_card_id, \
                                    models.favorites.c.user_id == user_id)) 
     
     print("crud.get_my_favorite_photo_cards() - about to print the statement")
     print(s)    
     result = await database.fetch_all(query=s, values=params)     
    #  query = select([models.photo_cards, models.users.c.username.label("owner_name"), models.favorites.c.id.label("favorite_id")]).\
    #              select_from(j_comb). \
    #              offset(skip).limit(limit).\
    #              order_by(models.photo_cards.c.id.desc())

    #  print("crud.get_my_favorite_photo_cards() - about to print query")
    #  print(query)
    #  result = await database.fetch_all(query)
     print("crud.get_my_favorite_photo_cards - after query - result is:")
     print(result)     
     return result


async def get_photo_card(database: Database,
                         photo_card_id: int,
                         user_id: int=0):
    print("crud.get_photo_card() - at top -- new implementation")
    # query = models.photo_cards.select().where(models.photo_cards.c.id == photo_card_id)

    s = """SELECT photo_cards.id, 
       photo_cards.front_file_name, 
       photo_cards.back_file_name, 
       photo_cards.group_name, 
       photo_cards.card_name, 
       photo_cards.share, 
       photo_cards.source_type, 
       photo_cards.source_name, 
       photo_cards.user_id, 
       users.username AS owner_name, 
       favorites.id AS favorite_id, 
       (SELECT count(id) from favorites where photo_card_id = :card_id) AS favorite_cnt 
    FROM photo_cards JOIN users ON photo_cards.user_id = users.id AND photo_cards.id = :card_id  
    LEFT OUTER JOIN favorites ON photo_cards.id = favorites.photo_card_id AND favorites.user_id = :user_id
    """
    print("crud.get_photo_card() - about to print the statement")
    print(s)    
    result = await database.fetch_one(query=s, values={"card_id": photo_card_id, "user_id": user_id})

    # j = models.photo_cards.join(right=models.users, \
    #                 onclause=and_(models.photo_cards.c.user_id == models.users.c.id,\
    #                             models.photo_cards.c.id == photo_card_id)). \
    #                 join(right=models.favorites,  \
    #                     onclause=and_(models.photo_cards.c.id == models.favorites.c.photo_card_id, \
    #                             models.favorites.c.user_id == user_id), isouter=True)     
   
    # query = select([models.photo_cards, models.users.c.username.label("owner_name"), models.favorites.c.id.label("favorite_id")]).\
    #             select_from(j)
    # print("crud.get_photo_card() - about to print query")
    # print(query)
    # result = await database.fetch_one(query)
    print("crud.get_photo_card() - after query - result is:")
    print(result)
    return result

async def is_photo_card_shared(database: Database,
                               front_file_name: str,
                               back_file_name: str):
    print("crud.is_photo_card_shared()")
    
    if front_file_name is not None:
        query = models.photo_cards.select().where(models.photo_cards.c.front_file_name == front_file_name) 
    else:
        query = models.photo_cards.select().where(models.photo_cards.c.back_file_name == back_file_name) 
        
    print("crud.is_photo_card_shared() - about to print query")
    print(query)
    result = await database.fetch_one(query)
    print("crud.is_photo_card_shared() - after query - result is:")
    print(result)

    if result is None:
         return None
    
    card_is_shared = False

    if result is not None:
         card_is_shared = result._mapping['share']

    # for row in result:
    #     print("crud.is_photo_card_private() - got result - row is:")
    #     print(row)
    #     card_is_private = row._mapping['is_private']

    return card_is_shared 

async def get_count_photo_card_shared(database: Database,
                                      user_id: int):
    print("crud.get_count_photo_card_shared()")

    stmt = select(func.count()).select_from(models.photo_cards).where(
        models.photo_cards.c.user_id == user_id,
        models.photo_cards.c.share == True
    )

    print("crud.get_count_photo_card_shared() - about to print query")
    print(stmt)
    result = await database.fetch_one(stmt)
    print("crud.get_count_photo_card_shared() - after query - result is:")
    print(result)

    card_count = 0
    if result is not None:
         card_count = result._mapping['count_1']

    print("crud.get_count_photo_card_shared() - at end - about to return card_count:")
    print(card_count)

    return card_count 

async def delete_photo_card(database: Database, photo_card_id: int, user_id: int):
    print("crud.delete_photo_card()")
    query = models.photo_cards.delete().where(models.photo_cards.c.id == photo_card_id, models.photo_cards.c.user_id == user_id)
    print("crud.delete_photo_card() - about to print query")
    print(query)

    result = await database.execute(query)
    #seems that 'result' contains the count of rows impacted
    print("crud.delete_photo_card() - after delete, about to print 'result'")
    print(result)

    return {"message":"PhotoCard deleted"}

#Favorites cruds
async def create_favorite(database: Database, 
                       favorite: schemas.FavoriteBase):
    print("crud.create_favorite()")

    query = models.favorites.insert().values(user_id=favorite.user_id,
                                             photo_card_id=favorite.photo_card_id)

    print("crud.create_favorite() - about to print query")
    print(query)
    
    try:
        last_record_id = await database.execute(query)
    except UniqueViolationError as uve:
        print(uve)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Favorite already exists for this user and photo card")
    except Exception as ex:
        print(ex)
        raise ex

    print("crud.create_favorite() - after db insert - last_record_id is:")
    print(last_record_id)

    # report object with 'owner_name' empty - caller will need to fill in since that requires join query
    resp_favorite = schemas.Favorite(id=last_record_id,
                                     user_id=favorite.user_id,
                                     photo_card_id=favorite.photo_card_id)
    return resp_favorite

async def get_favorites(database: Database, user_id: int, skip: int=0, limit: int=100):
     print("crud.get_favorites() - at top")
     

     if user_id is None :
        query = models.favorites.select().\
                 offset(skip).limit(limit)
     else:
        query = models.favorites.select().where(models.favorites.c.user_id == user_id).\
                 offset(skip).limit(limit)
        
     print("crud.get_favorites() - about to print query")
     print(query)

     result = await database.fetch_all(query)
     print("crud.get_favorites() - after query - result is:")
     print(result)     
     return result

async def get_favorite(database: Database,
                       photo_card_id: int,
                       user_id: int):
    print("crud.get_favorite() - at top")
    query = models.favorites.select().where(models.favorites.c.photo_card_id == photo_card_id, 
                                            models.favorites.c.user_id == user_id)
    print("crud.get_favorite() - about to print query")
    print(query)
    result = await database.fetch_one(query)
    print("crud.get_photo_card() - after query - result is:")
    print(result)
    return result

async def delete_favorite(database: Database, favorite_id: int):

    print("crud.delete_favorite()")
    query = models.favorites.delete().where(models.favorites.c.id == favorite_id)
    print("crud.delete_favorite() - about to print query")
    print(query)

    result = await database.execute(query)
    #seems that 'result' contains the count of rows impacted
    print("crud.delete_favorite() - after delete, about to print 'result'")
    print(result)

    return {"message":"Favorite deleted"}

async def delete_favorites_except_owners(database: Database, photo_card_id: int, user_id: int):

    print("crud.delete_favorites_except_owners()")
    query = models.favorites.delete().where(models.favorites.c.photo_card_id == photo_card_id,
                                            models.favorites.c.user_id != user_id);
    print("crud.delete_favorites_except_owners() - about to print query")
    print(query)

    result = await database.execute(query)
    #seems that 'result' contains the count of rows impacted
    print("crud.delete_favorites_except_owners() - after delete, about to print 'result'")
    print(result)

    return {"message":"Favorites deleted"}

