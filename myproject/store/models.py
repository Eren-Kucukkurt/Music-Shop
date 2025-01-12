from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.db.models import Avg
from decimal import Decimal
from django.utils.timezone import now
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.mail import send_mail
from decimal import Decimal
from background_task import background
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.urls import reverse
from django.conf import settings
from django.utils.html import format_html
import os


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255, default="Unnamed Product")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    model = models.CharField(max_length=100, default="Unknown Model")
    serial_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    quantity_in_stock = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Cost field
    warranty_status = models.CharField(max_length=100, default="No Warranty")
    distributor_info = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)

    # Discount Fields
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    discount_start_date = models.DateTimeField(null=True, blank=True)
    discount_end_date = models.DateTimeField(null=True, blank=True)
    is_discount_active = models.BooleanField(default=False)

    # Other Fields
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_sale = models.PositiveIntegerField(default=0)
    popularity = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def get_absolute_url(self):
        return reverse('product-detail', args=[str(self.id)])

    @property
    def discounted_price(self):
        """
        Property to calculate and return the discounted price if the discount is active.
        """
        now = timezone.now()
        if self.is_discount_active and self.discount_start_date and self.discount_end_date:
            if self.discount_start_date <= now <= self.discount_end_date:
                return self.price - (self.price * (self.discount_percentage / 100))
        return self.price

    def get_discounted_price(self):
        """
        Calculate and return the discounted price if the discount is active.
        """
        now = timezone.now()
        if self.is_discount_active and self.discount_start_date and self.discount_end_date:
            if self.discount_start_date <= now <= self.discount_end_date:
                return self.price - (self.price * (self.discount_percentage / 100))
        return self.price
    def update_rating(self):
        """
        Update the product's rating based on approved reviews.
        """
        reviews = Review.objects.filter(product=self)
        if reviews.exists():
            # Calculate the average rating
            average_rating = reviews.aggregate(Avg('rating'))['rating__avg']
            self.rating = average_rating or 0  # Default to 0 if no reviews
        else:
            self.rating = 0  # No reviews, set rating to 0
        self.save()

    def save(self, *args, **kwargs):
        """
        Auto-toggle `is_discount_active` based on discount fields.
        Notify wishlist users if a new discount is activated.
        """
        weight_sales = Decimal("0.7")
        weight_rating = Decimal("0.3")
        self.popularity = (Decimal(self.total_sale) * weight_sales) + (Decimal(self.rating) * weight_rating)
        previous_discount_status = self.is_discount_active
        now = timezone.now()

        # Determine if the discount should be active
        if (
            self.discount_percentage > 0
            and self.discount_start_date
            and self.discount_end_date
            and self.discount_start_date <= now <= self.discount_end_date
        ):
            self.is_discount_active = True
        else:
            self.is_discount_active = False

        super().save(*args, **kwargs)

        # Trigger email notification only if a new discount is activated
        if self.is_discount_active:
            notify_wishlist_users(self.id)


# Background task to notify wishlist users
@background(schedule=1)
def notify_wishlist_users(product_id):
    from .models import Product, Wishlist

    product = Product.objects.get(id=product_id)
    wishlists = Wishlist.objects.filter(products=product)

    for wishlist in wishlists:
        user_email = wishlist.user.email
        send_discount_email(user_email, product)



# Utility to send the discount email with a "Go to Product" button
def send_discount_email(user_email, product):
    subject = f"Great News! {product.name} is Now on Discount!"
    
    # Construct the plain text message with product details
    message = f"""
    Hi there,

    We're excited to let you know that one of your favorite products from your wishlist is now on discount!

    🛍️ Product: {product.name}
    💸 Original Price: ${product.price:.2f}
    🔥 Discounted Price: ${product.get_discounted_price():.2f}
    📉 Discount: {product.discount_percentage:.2f}%

    Product Description:
    {product.description}

    Thank you for shopping with us!

    Best regards,  
    🎸 The Music Shop Team  
    """

    # Create and send the email
    email = EmailMessage(
        subject,
        message,
        'musicshop308@gmail.com',
        [user_email]
    )

    # Attach the product image
    if product.image:
        email.attach_file(product.image.path)

    email.send()

class Review(models.Model):
    product = models.ForeignKey('Product', related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, null=True)  # Comment is now optional
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

class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="wishlist")
    products = models.ManyToManyField('Product', related_name="wishlisted_by")

    def __str__(self):
        return f"Wishlist of {self.user.username}"