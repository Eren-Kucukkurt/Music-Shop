from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

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



#08/11/2024
class Review(models.Model):
    product = models.ForeignKey('Product', related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )  # Rating from 1 to 5
    comment = models.TextField()  # The text content of the review
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=False)  # New field for admin approval

    def __str__(self):
        return f"Review for {self.product.name} by {self.user.username}"

class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} purchased {self.product.name}"
