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