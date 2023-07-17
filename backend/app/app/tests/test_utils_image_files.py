from fastapi import UploadFile, File
import os
import asyncio
import pytest

from app.tests import utils
from app.utils import save_image_file, delete_image_file, image_file_exists

# pytest_plugins = ('pytest_asyncio',)

test_file_dir = "app/tests/test_files"

class TestUtilsImageFiles:

    def test_image_file_exists(self):
        assert image_file_exists("test_file1.txt", dir=test_file_dir)
    
    def test_image_file_does_not_exist1(self, tmpdir):
        assert not image_file_exists("foo.txt", dir=tmpdir)

    @pytest.mark.asyncio
    async def test_saving_valid_file(self, tmpdir):
        f = UploadFile(open(test_file_dir+'/test_file1.txt', 'rb'), filename=test_file_dir+'/test_file1.txt')
        file_name = await save_image_file(f, "test1", "suffix", tmpdir)
        print(file_name)
        assert file_name == "test1_suffix.txt"

        #now check that contents are same
        new_file_contents = open(os.path.join(tmpdir, file_name), "r").read()
        orig_file_contents = open(test_file_dir+'/test_file1.txt', "r").read()
        print(new_file_contents)
        print(orig_file_contents)
        assert new_file_contents == orig_file_contents

    @pytest.mark.asyncio
    async def test_saving_non_existant_file(self, tmpdir):
        f = None
        file_name = await save_image_file(f, "test2", "suffix", tmpdir)
        assert file_name == None

    @pytest.mark.asyncio
    async def test_checking_file_exists(self, tmpdir):
        # first save a file
        f = UploadFile(open(test_file_dir+'/test_file1.txt', 'rb'), filename=test_file_dir+'/test_file1.txt')
        file_name = await save_image_file(f, "test1", "suffix", tmpdir)
        print(file_name)
        assert file_name == "test1_suffix.txt"

        # now call function to verify it exists
        assert image_file_exists(file_name, tmpdir)

    def test_checking_file_does_not_exist(self, tmpdir):
        # call function with a file name that does not exist
        assert not image_file_exists('foo.txt', tmpdir)     

    @pytest.mark.asyncio
    async def test_deleting_file_that_exists(self, tmpdir):
        # first save a file
        f = UploadFile(open(test_file_dir+'/test_file1.txt', 'rb'), filename=test_file_dir+'/test_file1.txt')
        file_name = await save_image_file(f, "test1", "suffix", tmpdir)
        print(file_name)
        assert file_name == "test1_suffix.txt"   
        assert image_file_exists(file_name, tmpdir)

        # now delete it
        message = await delete_image_file(file_name, tmpdir)
        print(message)
        assert message == "File '"+file_name+"' removed"

        #make sure it is no longer there
        assert not image_file_exists(file_name, tmpdir)

    @pytest.mark.asyncio
    async def test_deleting_file_that_does_not_exist(self, tmpdir):
        # delete a file that does not exist
        message = await delete_image_file("foo.txt", tmpdir)
        print(message)
        assert message == "File 'foo.txt' does not exist to be removed"

        # try passing None object as File
        file_name = None
        message2 = await delete_image_file(file_name, tmpdir)
        assert message2 == None

        # try passing empty string as File name
        message3 = await delete_image_file('', tmpdir)
        assert message3 == None