from django.db import models
from django.contrib.auth.models import User

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
