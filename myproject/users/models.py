from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from cryptography.fernet import Fernet
import re
from django.core.exceptions import ValidationError
from django.conf import settings
from cryptography.fernet import Fernet
from .utils import get_fernet
from django.utils.crypto import get_random_string

from django.utils.crypto import get_random_string

def generate_tax_id():
    """Generates a unique 10-digit Tax ID."""
    return get_random_string(length=10, allowed_chars='0123456789')

class Profile(models.Model):
    ROLE_CHOICES = [
        ('CUSTOMER', 'Customer'),
        ('PRODUCT_MANAGER', 'Product Manager'),
        ('SALES_MANAGER', 'Sales Manager'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    tax_id = models.CharField(max_length=20, unique=True, default=generate_tax_id)
    home_address = models.TextField(null=True, blank=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"


    def save(self, *args, **kwargs):
        if not self.tax_id:
            # Generate a random 10-digit Tax ID if it doesn't exist
            self.tax_id = get_random_string(length=10, allowed_chars='0123456789')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"


def get_fernet():
    """Retrieve the Fernet instance using the secret key."""
    from django.conf import settings
    return Fernet(settings.FERNET_KEY)

class CreditCard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_cards')
    encrypted_card_number = models.CharField(max_length=256)  # Encrypted card number
    encrypted_expiry_date = models.CharField(max_length=256)  # Encrypted expiry date
    encrypted_cvv = models.CharField(max_length=256)  # Encrypted CVV
    card_name = models.CharField(max_length=255)  # Name on the card
    last4 = models.CharField(max_length=4, editable=False, default="****")  # Last 4 digits of the card
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        """Override save to encrypt card details before storing in the database."""
        fernet = get_fernet()
        # Ensure card details are strings and encrypt them
        if self.encrypted_card_number and isinstance(self.encrypted_card_number, str):
            if not self.encrypted_card_number.startswith("gAAAA"):
                self.encrypted_card_number = fernet.encrypt(self.encrypted_card_number.encode()).decode()
                print("Encrypted card number")
        elif not self.encrypted_card_number:
            raise ValueError("Card number cannot be empty.")

        if self.encrypted_expiry_date and isinstance(self.encrypted_expiry_date, str):
            if not self.encrypted_expiry_date.startswith("gAAAA"):
                self.encrypted_expiry_date = fernet.encrypt(self.encrypted_expiry_date.encode()).decode()
        else:
            raise ValueError("Expiry date cannot be empty.")

        if self.encrypted_cvv and isinstance(self.encrypted_cvv, str):
            if not self.encrypted_cvv.startswith("gAAAA"):
                self.encrypted_cvv = fernet.encrypt(self.encrypted_cvv.encode()).decode()
        else:
            raise ValueError("CVV cannot be empty.")

        super().save(*args, **kwargs)


    def get_decrypted_card_number(self):
        """Decrypt and return the card number."""
        fernet = get_fernet()
        return fernet.decrypt(self.encrypted_card_number.encode()).decode()

    def get_decrypted_expiry_date(self):
        """Decrypt and return the expiry date."""
        fernet = get_fernet()
        return fernet.decrypt(self.encrypted_expiry_date.encode()).decode()

    def get_decrypted_cvv(self):
        """Decrypt and return the CVV."""
        fernet = get_fernet()
        return fernet.decrypt(self.encrypted_cvv.encode()).decode()

    def clean(self):
        """Validate card details before saving."""
        card_number_regex = r'^\d{16}$'
        expiry_date_regex = r'^(0[1-9]|1[0-2])\/\d{2}$'
        cvv_regex = r'^\d{3}$'

        try:
            decrypted_card_number = self.get_decrypted_card_number()
            decrypted_expiry_date = self.get_decrypted_expiry_date()
            decrypted_cvv = self.get_decrypted_cvv()
        except Exception:
            raise ValidationError("Failed to decrypt card details for validation.")

        if not re.match(card_number_regex, decrypted_card_number):
            raise ValidationError("Card number must be exactly 16 digits.")
        if not re.match(expiry_date_regex, decrypted_expiry_date):
            raise ValidationError("Expiry date must be in MM/YY format.")
        if not re.match(cvv_regex, decrypted_cvv):
            raise ValidationError("CVV must be a 3-digit number.")

    def __str__(self):
        return f"{self.card_name} - **** **** **** {self.last4}"
