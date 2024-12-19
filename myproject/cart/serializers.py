from rest_framework import serializers
from .models import *

class CartItemSerializer(serializers.ModelSerializer):
    
    product = serializers.StringRelatedField()  # Serialize product as a string (e.g., name)
    product_image = serializers.SerializerMethodField()  # Add product image
    price = serializers.SerializerMethodField()  # Add product price
    total_price = serializers.SerializerMethodField()  # Add total price (quantity * price)
    is_at_max_stock = serializers.SerializerMethodField()  # Add this
    stock_quantity = serializers.SerializerMethodField()   # Add this

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_image', 'quantity', 'price', 'total_price', 'is_at_max_stock', 'stock_quantity']

    def get_price(self, obj):
        return obj.product.price  # Ensure product has a price

    def get_total_price(self, obj):
        return obj.quantity * obj.product.price  # Quantity * price

    def get_is_at_max_stock(self, obj):
        return obj.quantity >= obj.product.quantity_in_stock

    def get_stock_quantity(self, obj):
        return obj.product.quantity_in_stock
    
    def get_product_image(self, obj):
        return obj.product.image.url if obj.product.image else None



class CartSerializer(serializers.ModelSerializer):
    
    items = CartItemSerializer(many=True)  # Include all related items in the cart
#neden read only??
    class Meta:
        model = Cart
        fields = ['id', 'user', 'session_id', 'items', 'created_at']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image_url = serializers.SerializerMethodField()
    original_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    refunded_quantity = serializers.IntegerField(read_only=True)
    refundable_quantity = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_image_url', 'quantity', 
            'original_price', 'price', 'refunded_quantity', 'refundable_quantity'
        ]

    def get_product_image_url(self, obj):
        request = self.context.get('request')
        if obj.product and obj.product.image:
            return request.build_absolute_uri(obj.product.image.url)
        return None

    def get_refundable_quantity(self, obj):
        return obj.quantity - obj.refunded_quantity







class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'status', 'created_at', 'items']

    def get_total_price(self, obj):
        """
        Calculate the total price for the order from all OrderItems.
        """
        return sum(item.price for item in obj.items.all())

class RefundSerializer(serializers.ModelSerializer):
    order_item = serializers.SerializerMethodField()
    user = serializers.StringRelatedField()  # To show the username

    class Meta:
        model = Refund
        fields = [
            'id',
            'order_item',
            'user',
            'requested_quantity',
            'requested_at',
            'resolved_at',
            'status',
            'refund_amount',
            'reason',
        ]

    def get_order_item(self, obj):
        """Return minimal product details for the order item."""
        return {
            'product_name': obj.order_item.product_name,
            'order_id': obj.order_item.order.id,
        }