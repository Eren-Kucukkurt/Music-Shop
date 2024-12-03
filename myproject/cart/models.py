
from django.db import models
from django.contrib.auth.models import User
from store.models import Product
import uuid
from datetime import timedelta
from django.utils.timezone import now

class Cart(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=255, unique=True, null=True, blank=True)  # For guest users
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart ({self.user.username if self.user else 'Guest'})"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    #product_image = models.ImageField(upload_to='product_images', null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    @property
    def total_price(self):
        return self.quantity * self.product.price

class Order(models.Model):
    STATUS_CHOICES = [
        ('PROCESSING', 'Processing'),
        ('IN-TRANSIT', 'In-Transit'),
        ('DELIVERED', 'Delivered'),
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PROCESSING')
    created_at = models.DateTimeField(auto_now_add=True)
    last_status_change = models.DateTimeField(default=now)  # Set default value to now

    def update_status(self):
        """Update the status based on time elapsed."""
        elapsed_time = now() - self.last_status_change

        if self.status == 'PROCESSING' and elapsed_time > timedelta(seconds=60):
            self.status = 'IN-TRANSIT'
            self.last_status_change = now()
            self.save()
        elif self.status == 'IN-TRANSIT' and elapsed_time > timedelta(seconds=10):
            self.status = 'DELIVERED'
            self.last_status_change = now()
            self.save()

    def __str__(self):
        return f"Order {self.id} - {self.get_status_display()}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Order {self.order.id})"
