from rest_framework import serializers
from .models import *
from django.db.models import Avg
from decimal import Decimal
from .models import Wishlist

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
            "category": obj.product.category,
            "price": float(obj.product.price),  # Convert Decimal to float
        }





class ProductSerializer(serializers.ModelSerializer):
    discounted_price = serializers.SerializerMethodField()  # Dynamically calculate discounted price

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'category',
            'model',
            'serial_number',
            'description',
            'quantity_in_stock',
            'price',
            'cost',  # New cost field added
            'discount_percentage',      # Added discount percentage
            'discount_start_date',      # Added start date for discount
            'discount_end_date',        # Added end date for discount
            'is_discount_active',       # Added status for discount activation
            'warranty_status',
            'distributor_info',
            'image',
            'rating',  # Ensure rating is included
            'total_sale',
            'popularity',
            'discounted_price',         # Dynamically calculated field
        ]

    def to_representation(self, instance):
        """
        Override the representation to ensure 'rating' is a float.
        """
        data = super().to_representation(instance)
        data['rating'] = float(data['rating']) if instance.rating is not None else 0
        return data

    def get_discounted_price(self, obj):
        """
        Calculate the discounted price if discount is active.
        """
        return obj.get_discounted_price()



class WishlistSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True)  # Use ProductSerializer for detailed product info

    class Meta:
        model = Wishlist
        fields = ['id', 'products']
