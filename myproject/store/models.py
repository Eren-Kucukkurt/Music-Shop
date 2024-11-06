from django.db import models

class Product(models.Model):
    # ID is created automatically as the primary key by Django
    name = models.CharField(max_length=255)
    model = models.CharField(max_length=100)  # E.g., "Model X1000"
    serial_number = models.CharField(max_length=100, unique=True)  # Unique serial number for each product
    description = models.TextField()
    quantity_in_stock = models.PositiveIntegerField()  # Only allows positive integers
    price = models.DecimalField(max_digits=10, decimal_places=2)
    warranty_status = models.CharField(max_length=100)  # E.g., "1 year", "2 years", etc.
    distributor_info = models.CharField(max_length=255)  # Information about the distributor

    def __str__(self):
        return f"{self.name} ({self.model})"

