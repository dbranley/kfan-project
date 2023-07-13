import os
import aiofiles
import re

from fastapi import File


async def save_image_file(file: File, prefix: str, suffix: str, dir: str='images'):
    print("save_image_file()")

    if (file == None):
        return None

    file_filename, file_extension = os.path.splitext(file.filename)
    print("save_image_file() - file_filename="+file_filename+"=, file_extension="+file_extension+"=")

    #create unique filename
    file_name = prefix + "_" + suffix + file_extension
    print("save_image_file() - new file_name ="+file_name+"=")

    out_file_path = os.path.join(dir, file_name)
    async with aiofiles.open(out_file_path, 'wb') as out_file:
        while content := await file.read(1024): #async read chunk
            await out_file.write(content) # async write chunk
    
    return file_name

async def delete_image_file(filename: str, dir: str='images'):
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
        ret_message = "File '"+filename+"' does not exist to be removed"

    return ret_message

def image_file_exists(filename: str, dir: str='images'):
    print("image_file_exists() - filename is:")
    print(filename)

    if (filename == None or len(filename) == 0):
            return False
    
    file_path = os.path.join(dir, filename)
    if (os.path.exists(file_path)):
        return True
    else: 
        return False
    
def validate_email(email: str):
    print("validate_email() - email is:")
    print(email)

    regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

    return re.match(regex, email)

