

from rest_framework import serializers
from .models import Cart, CartItem

class CartItemSerializer(serializers.ModelSerializer):
    
    product = serializers.StringRelatedField()  # Serialize product as a string (e.g., name)
    price = serializers.SerializerMethodField()  # Add product price
    total_price = serializers.SerializerMethodField()  # Add total price (quantity * price)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price']

    def get_price(self, obj):
        return obj.product.price  # Ensure product has a price

    def get_total_price(self, obj):
        return obj.quantity * obj.product.price  # Quantity * price


class CartSerializer(serializers.ModelSerializer):
    
    items = CartItemSerializer(many=True)  # Include all related items in the cart
#neden read only??
    class Meta:
        model = Cart
        fields = ['id', 'user', 'session_id', 'items', 'created_at']
