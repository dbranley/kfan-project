from app.tests import utils
from app.utils import validate_email

class TestUtilsEmailValidation:

    def test_valid_email1(self):
        assert validate_email("user@email.com")
    
    def test_valid_email2(self):
        assert validate_email("user@email.eu")
    
    def test_invalid_email1(self):
        assert not validate_email("user@email")
    
    def test_invalid_email2(self):
        assert not validate_email("user@email.c")

    def test_invalid_email3(self):
        assert not validate_email("useremail.com")
