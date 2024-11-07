from django.db import models

class Product(models.Model):
    # ID is created automatically as the primary key by Django
    name = models.CharField(max_length=255, default="Unnamed Product")
    category = models.CharField(max_length=100, default="Uncategorized")  # E.g., "Electric Guitar", "Piano"
    model = models.CharField(max_length=100, default="Unknown Model")  # E.g., "Model X1000"
    serial_number = models.CharField(max_length=100, unique=True, null=True, blank=True)  # Unique serial number
    description = models.TextField(null=True, blank=True)
    quantity_in_stock = models.PositiveIntegerField(default=0)  # Defaults to 0 if stock not specified
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    warranty_status = models.CharField(max_length=100, default="No Warranty")  # E.g., "1 year", "2 years"
    distributor_info = models.CharField(max_length=255, null=True, blank=True, default="Unknown Distributor")
    image = models.ImageField(upload_to="products/", null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.model})"


