
from django.db import models
from django.contrib.auth.models import User
from store.models import Product
import uuid
from datetime import timedelta
from django.utils.timezone import now
from django.utils import timezone

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
        ('CANCELED', 'Canceled'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PROCESSING')
    created_at = models.DateTimeField(default=timezone.now)  # Allow editing

    last_status_change = models.DateTimeField(default=timezone.now)

    def cancel_order(self):
        """Cancel the order and return items to stock if it is still in PROCESSING."""
        if self.status != 'PROCESSING':
            raise ValueError("Only orders in the 'PROCESSING' state can be canceled.")
        # Return items to stock
        for item in self.items.all():  # 'items' is the related_name in OrderItem
            if item.product:
                item.product.quantity_in_stock += item.quantity
                item.product.save()
        # Update the order status
        self.status = 'CANCELED'
        self.last_status_change = now()
        self.save()    

    def __str__(self):
        return f"Order {self.id} - {self.get_status_display()}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255, null=True, blank=True)
    product_image = models.ImageField(upload_to='order_item_images/', null=True, blank=True)
    product_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Final price after discount
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    refunded_quantity = models.PositiveIntegerField(default=0)  # Track refunded items
    is_return_requested = models.BooleanField(default=False)
    is_return_approved = models.BooleanField(default=False)
    requested_return_quantity = models.PositiveIntegerField(null=True, blank=True)

    def refundable_quantity(self):
        """Calculate the quantity that can still be refunded."""
        return max(0, self.quantity - self.refunded_quantity)

    def save(self, *args, **kwargs):
        """Snapshot product details at the time of order creation."""
        if self.product and self._state.adding:
            self.product_name = self.product.name
            self.product_image = self.product.image
            self.product_price = self.product.price

        self.original_price = self.product.price if self.product else None
        self.price = (self.product.get_discounted_price() * self.quantity) if self.product else 0
        super().save(*args, **kwargs)

    def request_return(self, quantity):
        """Request a return for this order item."""
        if self.order.status != 'DELIVERED':
            raise ValueError("Return can only be requested for delivered items.")
        if quantity > self.refundable_quantity():
            raise ValueError("Return quantity cannot exceed the refundable quantity.")

        self.is_return_requested = True
        self.requested_return_quantity = quantity
        self.save()

    def approve_return(self):
        """Approve the return and update stock."""
        if not self.is_return_requested:
            raise ValueError("No return request exists for this item.")
        if self.requested_return_quantity > self.refundable_quantity():
            raise ValueError("Requested return quantity exceeds refundable quantity.")

        self.is_return_requested = False
        self.is_return_approved = True

        if self.product:
            self.product.quantity_in_stock += self.requested_return_quantity
            self.product.save()

        self.refunded_quantity += self.requested_return_quantity
        self.save()

    def __str__(self):
        return f"{self.quantity} x {self.product_name or 'Deleted Product'} (Order {self.order.id})"


class Refund(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('DENIED', 'Denied'),
    ]

    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='refunds')
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Customer requesting the refund
    requested_quantity = models.PositiveIntegerField()  # Quantity to be refunded
    requested_at = models.DateTimeField(auto_now_add=True)  # When the refund was requested
    resolved_at = models.DateTimeField(null=True, blank=True)  # When it was resolved
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Amount to be refunded
    reason = models.TextField(null=True, blank=True)  # Optional: Reason for the refund request
    admin_notes = models.TextField(null=True, blank=True)  # Notes added by the sales manager

    def calculate_refund_amount(self):
        """Calculate refund amount based on the requested quantity."""
        return (self.order_item.price / self.order_item.quantity) * self.requested_quantity

    def approve(self):
        """Approve the refund and update related entities."""
        if self.status != 'PENDING':
            raise ValueError("Refund is not in a pending state.")

        refundable_quantity = self.order_item.refundable_quantity()
        if self.requested_quantity > refundable_quantity:
            raise ValueError("Refund quantity exceeds the refundable quantity.")

        self.status = 'APPROVED'
        self.resolved_at = now()
        self.refund_amount = self.calculate_refund_amount()

        if self.order_item.product:
            self.order_item.product.quantity_in_stock += self.requested_quantity
            self.order_item.product.save()

        self.order_item.refunded_quantity += self.requested_quantity
        self.order_item.save()

        self.save()

    def deny(self):
        """Deny the refund request."""
        self.status = 'DENIED'
        self.resolved_at = now()
        self.save()

    def __str__(self):
        return f"Refund #{self.id} - {self.get_status_display()} for {self.requested_quantity} item(s)"

class Delivery(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('DELIVERED', 'Delivered'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    products = models.ManyToManyField(Product, related_name='deliveries')
    customer_name = models.CharField(max_length=100)
    delivery_address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Delivery for Order #{self.order.id} - Status: {self.get_status_display()}"