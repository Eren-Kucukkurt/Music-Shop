from cryptography.fernet import Fernet
from django.conf import settings

def get_fernet():
    """
    Retrieve the encryption key from settings and initialize Fernet.
    """
    key = settings.FERNET_KEY
    return Fernet(key)
