import os
import aiofiles
import re
import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, status
from dotenv import load_dotenv

from fastapi import File

load_dotenv()
FILE_STORAGE = os.getenv("FILE_STORAGE", "Local")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "kfanbucket-dev")
IMAGE_MAX_SIZE_MB = os.getenv("IMAGE_MAX_SIZE_MB", "3")
IMAGE_MAX_SIZE = int(float(IMAGE_MAX_SIZE_MB) * 1024 * 1024)

async def save_image_file(file: File, prefix: str, suffix: str, dir: str='app/images'):
    print("save_image_file()")

    if (file == None):
        return None

    file_filename, file_extension = os.path.splitext(file.filename)
    print("save_image_file() - file_filename="+file_filename+"=, file_extension="+file_extension+"=")

    #create unique filename
    file_name = prefix + "_" + suffix + file_extension
    print("save_image_file() - new file_name ="+file_name+"=")

    #save locally to be available for download
    out_file_path = os.path.join(dir, file_name)
    total_content_len = 0
    async with aiofiles.open(out_file_path, 'wb') as out_file:
        while content := await file.read(1024): #async read chunk
            total_content_len += len(content)
            if (total_content_len > IMAGE_MAX_SIZE):
                print("save_image_file() - file too large, so raise exception")
                delete_partially_saved_file(file_name, dir)
                raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 
                            detail="Image file too large, not to exceed "+IMAGE_MAX_SIZE_MB+"MB")            
            await out_file.write(content) # async write chunk
    print("save_image_file() - after saving file_name ="+file_name+"= - total_content_len is ="+str(total_content_len)+"=")

    #save in S3 to be available from other instances
    if (FILE_STORAGE == "S3"):
        print("save_image_file() - FILE_STORAGE is 'S3', so try saving to cloud")
        s3_client = boto3.client('s3')
        try:
            response = s3_client.upload_file(out_file_path, AWS_S3_BUCKET, file_name)
        except ClientError as e:
            print("Exception saving file to S3")
            print(e)
            raise e

    return file_name

async def delete_image_file(filename: str, dir: str='app/images'):
    print("delete_image_file() - filename is:")
    print(filename)

    if (filename == None or len(filename) == 0):
        return None
    
    file_path = os.path.join(dir, filename)
    print("delete_image_file() - about to check if file_path exists - file_path is:")
    print(file_path)

    if os.path.exists(file_path):
        print("delete_image_file() - file_path exists, so try to remove it")
        os.remove(file_path)
        ret_message = "File '"+filename+"' removed"
    else:
        ret_message = "File '"+filename+"' does not exist locally to be removed"

    #Delete from S3

    if (FILE_STORAGE == "S3"):
        print("delete_image_file() - FILE_STORAGE is 'S3', so delete from S3 bucket in Cloud")
        s3_client = boto3.client('s3')
        try:
            response = s3_client.delete_object(Bucket=AWS_S3_BUCKET, Key=filename)
            print("delete_image_file() - back from s3.delete_object() - response is:")
            print(response)
            #must be good, so return true
            print("delete_image_file() - must exist and now available locally, so return 'True' - file_path="+file_path)
            ret_message = "File '"+filename+"' removed"
        except ClientError as e:
            print("delete_image_file() - got ClientError - see if because does not exist in S3")
            if e.response['Error']['Code'] == '404':
                print("delete_image_file() - got 404, so does not exist on S3")
                ret_message = "File '"+filename+"' does not exist in Cloud to be removed"
            else: 
                #call failing for some other reason than 'not found', so rethrow
                print("delete_image_file() - call to S3 failing for some reason other than 'not found', so rethrow")
                print(e)
                raise e    

    return ret_message

def delete_partially_saved_file(filename: str, dir: str):
    print("delete_partially_saved_file() - filename is:")
    print(filename)

    if (filename == None or len(filename) == 0):
        return None
    
    file_path = os.path.join(dir, filename)
    print("delete_partially_saved_file() - about to check if file_path exists - file_path is:")
    print(file_path)

    if os.path.exists(file_path):
        print("delete_partially_saved_file() - file_path exists, so try to remove it")
        os.remove(file_path)
        ret_message = "File '"+filename+"' removed"
    else:
        ret_message = "File '"+filename+"' does not exist locally to be removed"
    
    return ret_message

#First see if it exists locally, if not then look on S3 and download
def image_file_exists(filename: str, dir: str='app/images'):
    print("image_file_exists() - filename is:")
    print(filename)

    if (filename == None or len(filename) == 0):
            return False
    
    file_path = os.path.join(dir, filename)
    if (os.path.exists(file_path)):
        return True

    #since does not exist locally, see if it is available in the cloud
    #save in S3 to be available from other instances
    if (FILE_STORAGE == "S3"):
        print("image_file_exists() - FILE_STORAGE is 'S3', so see if it exists in the cloud")
        s3_client = boto3.client('s3')
        try:
            response = s3_client.download_file(AWS_S3_BUCKET, filename, file_path)
            #must be good, so return true
            print("image_file_exists() - must exist and now available locally, so return 'True' - file_path="+file_path)
            return True
        except ClientError as e:
            print("image_file_exists() - does not exist in S3")
            if e.response['Error']['Code'] != '404':
                #call failing for some other reason than 'not found', so rethrow
                print("image_file_exists() - call to S3 failing for some reason other than 'not found', so rethrow")
                print(e)
                raise e    
    else:
        return False

def validate_email(email: str):
    print("validate_email() - email is:")
    print(email)

    regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

    return re.match(regex, email)

