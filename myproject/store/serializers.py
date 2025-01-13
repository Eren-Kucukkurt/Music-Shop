from rest_framework import serializers
from .models import *
from django.db.models import Avg
from decimal import Decimal
from .models import Wishlist

from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')  # Fetch the username from the related user
    product_details = serializers.SerializerMethodField()  # Add a custom field for product details

    class Meta:
        model = Review
        fields = [
            'id',
            'product',  # Keep the product ID
            'product_details',  # Include additional product details
            'user',
            'username',
            'rating',
            'comment',
            'created_at',
            'updated_at',
            'is_approved',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_approved']

    def get_product_details(self, obj):
        """
        Include selected product fields.
        """
        return {
            "name": obj.product.name,
            "model": obj.product.model,
            "category": obj.product.category.name if obj.product.category else "Uncategorized",
            "price": float(obj.product.price),  # Convert Decimal to float
        }





class ProductSerializer(serializers.ModelSerializer):
    discounted_price = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField()  # For absolute URL
    image = serializers.ImageField(required=False)  # Add the raw image field

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'category',
            'category_name',
            'model',
            'serial_number',
            'description',
            'quantity_in_stock',
            'price',
            'cost',
            'discount_percentage',
            'discount_start_date',
            'discount_end_date',
            'is_discount_active',
            'warranty_status',
            'distributor_info',
            'image',  # Include raw image field
            'image_url',  # Include absolute URL for frontend
            'rating',
            'total_sale',
            'popularity',
            'discounted_price',
        ]

    def get_discounted_price(self, obj):
        return obj.get_discounted_price()

    def get_image_url(self, obj):
        """
        Build the absolute URL for the product image.
        """
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None





class WishlistSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True)  # Use ProductSerializer for detailed product info

    class Meta:
        model = Wishlist
        fields = ['id', 'products']
