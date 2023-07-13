from fastapi import File
import os
import asyncio
import pytest

from utils import save_image_file, delete_image_file, image_file_exists

# pytest_plugins = ('pytest_asyncio',)


class TestUtilsImageFiles:

    def test_image_file_not_exists(self, tmp_path, tmpdir):
        print("test_image_file_not_exists() - at top")
        print(tmp_path)
        print(tmpdir)
        assert True
    
    def test_image_file_exists(self):
        assert image_file_exists("test_file1.txt", dir="tests/test_files")
    
    def test_image_file_does_not_exist1(self, tmpdir):
        assert not image_file_exists("foo.txt", dir=tmpdir)

    @pytest.mark.asyncio
    async def test_saving_file1(self, tmpdir):
        #get test file
        f = open('tests/test_files/test_file1.txt', 'r')
        file_name = save_image_file(f, "test1", "suffix", tmpdir)
        expected_file_name = await os.path.join(tmpdir, "test1_suffix.txt")
        assert file_name == expected_file_name
