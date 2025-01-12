from rest_framework import serializers
from .models import *
from store.models import Product
from store.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    
    product = serializers.CharField(source='product.name')
    product_image = serializers.SerializerMethodField()  # Add product image
    price = serializers.SerializerMethodField()  # Add product price
    total_price = serializers.SerializerMethodField()  # Add total price (quantity * price)
    is_at_max_stock = serializers.SerializerMethodField()  # Add this
    stock_quantity = serializers.SerializerMethodField()   # Add this

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_image', 'quantity', 'price', 'total_price', 'is_at_max_stock', 'stock_quantity']

    def get_price(self, obj):
        if obj.product.is_discount_active: 
            return obj.product.discounted_price  # Ensure product has a price
        else:
            return obj.product.price  # Ensure product has a price

    def get_total_price(self, obj):
        
        if obj.product.is_discount_active: 
            return obj.quantity * obj.product.discounted_price  # Ensure product has a price
        else:
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
class DeliverySerializer(serializers.ModelSerializer):
    # This already returns the M2M products as a simple list:
    products = ProductSerializer(many=True, read_only=True)

    # 1) Get the "customer_id" from the order's user (if it exists)
    customer_id = serializers.SerializerMethodField()

    # 2) Return the entire order's info, including items for quantity/product ID
    order_data = OrderSerializer(source='order', read_only=True)

    # 3) Include "total_price" from the related order
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Delivery
        fields = [
            'id',  # Delivery ID
            'customer_id',
            'order_data',
            'products',
            'customer_name',      # Optional textual name from the Delivery model
            'delivery_address',
            'status',
            'created_at',
            'updated_at',
            'total_price',
        ]

    def get_customer_id(self, obj):
        """Return the user.id from the related order, or None if not present."""
        if obj.order and obj.order.user:
            return obj.order.user.id
        return None

    def get_total_price(self, obj):
        """Sum of item prices from the related Order."""
        if obj.order:
            return sum(item.price for item in obj.order.items.all())
        return 0



