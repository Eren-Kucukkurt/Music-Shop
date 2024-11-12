from rest_framework import serializers
from .models import *
from django.db.models import Avg

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'rating', 'comment', 'created_at', 'updated_at', 'is_approved']
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_approved']

class ProductSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()  # New field for average rating

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
            'average_rating',  # Include the average rating field
        ]

    def get_average_rating(self, obj):
        # Calculate the average rating of approved reviews for the product
        average = Review.objects.filter(product=obj, is_approved=True).aggregate(Avg('rating'))['rating__avg']
        return round(average, 1) if average else None