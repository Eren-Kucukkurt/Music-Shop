from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from cryptography.fernet import Fernet

class Profile(models.Model):
    ROLE_CHOICES = [
        ('CUSTOMER', 'Customer'),
        ('PRODUCT_MANAGER', 'Product Manager'),
        ('SALES_MANAGER', 'Sales Manager'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

# Helper function to retrieve Fernet encryption key
def get_fernet():
    return Fernet(settings.SECRET_KEY[:32].encode())  # Ensure SECRET_KEY is at least 32 characters

class CreditCard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_cards')
    encrypted_card_number = models.CharField(max_length=256)  # Encrypted card number
    encrypted_expiry_date = models.CharField(max_length=256)  # Encrypted expiry date (MM/YY)
    encrypted_cvv = models.CharField(max_length=256)  # Encrypted CVV
    card_name = models.CharField(max_length=255)  # Name on the card
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        """Override save to encrypt card details before storing in the database."""
        fernet = get_fernet()
        self.encrypted_card_number = fernet.encrypt(self.encrypted_card_number.encode())
        self.encrypted_expiry_date = fernet.encrypt(self.encrypted_expiry_date.encode())
        self.encrypted_cvv = fernet.encrypt(self.encrypted_cvv.encode())
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

    def __str__(self):
        return f"{self.card_name} - **** **** **** {self.get_decrypted_card_number()[-4:]}"