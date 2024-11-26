from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.db.models import Avg
from decimal import Decimal
from django.utils.timezone import now

class Product(models.Model):
    name = models.CharField(max_length=255, default="Unnamed Product")
    category = models.CharField(max_length=100, default="Uncategorized")
    model = models.CharField(max_length=100, default="Unknown Model")
    serial_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    quantity_in_stock = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    warranty_status = models.CharField(max_length=100, default="No Warranty")
    distributor_info = models.CharField(max_length=255, null=True, blank=True, default="Unknown Distributor")
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_sale = models.PositiveIntegerField(default=0)
    popularity = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def update_rating(self):
        """
        Calculate and update the average rating of the product based on approved reviews.
        """
        from .models import Review  # Avoid circular import
        average = Review.objects.filter(product=self, is_approved=True).aggregate(Avg('rating'))['rating__avg']
        self.rating = round(Decimal(average), 2) if average else Decimal(0.00)
        self.save()

    def save(self, *args, **kwargs):
        """
        Update popularity before saving.
        """
        weight_sales = Decimal("0.7")
        weight_rating = Decimal("0.3")
        self.popularity = (Decimal(self.total_sale) * weight_sales) + (self.rating * weight_rating)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.model})"



#08/11/2024
class Review(models.Model):
    product = models.ForeignKey('Product', related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(default=now)  # Use default instead of auto_now_add
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        """
        Update the product's rating whenever a review is added or updated.
        """
        super().save(*args, **kwargs)
        self.product.update_rating()  # Update the product's rating

    def delete(self, *args, **kwargs):
        """
        Update the product's rating whenever a review is deleted.
        """
        product = self.product  # Reference the product before deletion
        super().delete(*args, **kwargs)
        product.update_rating()  # Update the product's rating

class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    quantity = models.PositiveIntegerField(default=1)  # Number of items purchased

    def save(self, *args, **kwargs):
        # Update the totalSale count for the product
        if not self.pk:  # Only update on creation, not on updates
            self.product.total_sale += self.quantity
            self.product.save()
        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.user.username} purchased {self.product.name}"
