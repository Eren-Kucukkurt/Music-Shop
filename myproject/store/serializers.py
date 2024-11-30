from rest_framework import serializers
from .models import *
from django.db.models import Avg

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')  # Fetch the username from the related user

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'username', 'rating', 'comment', 'created_at', 'updated_at', 'is_approved']
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_approved']


from decimal import Decimal

class ProductSerializer(serializers.ModelSerializer):
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
            'warranty_status',
            'distributor_info',
            'image',
            'rating',  # Ensure rating is included
            'total_sale',
            'popularity'
        ]

    def to_representation(self, instance):
        """
        Override the representation to ensure 'rating' is a float.
        """
        data = super().to_representation(instance)
        data['rating'] = float(data['rating']) if instance.rating is not None else 0
        return data
