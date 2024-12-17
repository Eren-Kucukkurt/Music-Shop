from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem

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
    product_name = serializers.ReadOnlyField(source='product.name')  # Fetch the product name
    original_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'original_price', 'price']




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
