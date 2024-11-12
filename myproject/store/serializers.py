from rest_framework import serializers
from .models import *

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'rating', 'comment', 'created_at', 'updated_at', 'is_approved']
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_approved']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'category',         # Added category to match the Product model
            'model',
            'serial_number',
            'description',
            'quantity_in_stock',
            'price',
            'warranty_status',
            'distributor_info',
            'image',            # Added image field to match the Product model
        ]


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # Nested serializer for product details

    class Meta:
        model = CartItem
        fields = ['product', 'quantity']



class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)  # Nested CartItems for all items in the cart

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items']
        read_only_fields = ['user', 'items']
