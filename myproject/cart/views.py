

from store.models import Product
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from store.models import Product


from rest_framework.exceptions import NotAuthenticated


class CartViewSet(viewsets.ViewSet):
    
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    
    def add_item(self, request):
        
        """POST /cart/add_item/ - Add an item to the cart."""

        print(f"request.data: {request.data}")
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        print(f"add_item called with product_id={product_id}, quantity={quantity}")

        # Validate the product
        product = get_object_or_404(Product, id=product_id)
        if product.quantity_in_stock < quantity:
            return Response(
                {"error": "Not enough stock available"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the cart
        cart = self.get_cart(request)

        # Add or update the item in the cart
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)


        if created:
        # If the item was newly created, set its quantity
            cart_item.quantity = quantity
        else:
            # Otherwise, update the quantity
            cart_item.quantity += quantity

        cart_item.quantity = min(cart_item.quantity, product.quantity_in_stock)  # Ensure stock limits
        cart_item.save()

        return Response(
            {"message": "Item added to cart successfully"},
            status=status.HTTP_200_OK
        )
    
    
    def list(self, request):
        
        """GET /cart/ - Retrieve cart details"""
        
        if request.user.is_authenticated:
            
            print(f"User: {request.user}")
            cart, _ = Cart.objects.get_or_create(user=request.user)
        
        else:
            
            
            guest_token = request.headers.get('Guest-Token')
            if not guest_token:
                raise NotAuthenticated("Guest token is required for guest users.")
            
            cart, _ = Cart.objects.get_or_create(session_id=guest_token)
            
            """
            session_id = request.session.session_key or request.session.create()
            print(f"Guest Cart - Session ID: {session_id}")
            cart, _ = Cart.objects.get_or_create(session_id=session_id)

            """
            

        print(f"cart: {cart}")
        print(f"cart.id: {cart.id}")

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    
    @action(detail=True, methods=['post'])
    def update_item(self, request, pk=None):
        
        """POST /cart/<product_id>/update_item/ - Update item quantity"""
        
        quantity = request.data.get('quantity')
        if not quantity:
            return Response({'error': 'Quantity is required'}, status=status.HTTP_400_BAD_REQUEST)

        print(f"update_item called with pk={pk}")

        cart = self.get_cart(request)
        print(f"cart: {cart}")

        cart_item = get_object_or_404(CartItem, id=pk, cart=cart)
        print(f"cart_item: {cart_item}")

        cart_item.quantity = quantity
        cart_item.save()
        return Response({'message': 'Item updated successfully'})

    
    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):

        if (request.method == 'OPTIONS'):
            return Response({'message': 'Options request received'})
        
        """POST /cart/<product_id>/remove_item/ - Remove an item from the cart"""

        print(f"remove_item called with pk={pk}")
        cart = self.get_cart(request)
        print(f"cart: {cart}")
        #product = get_object_or_404(Product, id=pk)
        #print(f"product: {product}")
        print(f"cart.id: {cart.id}")

        print("Existing cart items in the database:")
        for item in CartItem.objects.all():
           print(f"CartItem ID: {item.id}, Cart ID: {item.cart.id}, Product ID: {item.product.id}, Quantity: {item.quantity}")


        # Retrieve the CartItem directly using pk
        cart_item = get_object_or_404(CartItem, id=pk, cart=cart)
        print(f"cart_item: {cart_item}")
        

        if cart_item:
            cart_item.delete()
            return Response({'message': 'Item removed successfully'})
        else:
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)



    def get_cart(self, request):
        
        """Retrieve the cart based on access token or guest token."""
        
        if request.user.is_authenticated:
            # Logged-in user cart
            cart, _ = Cart.objects.get_or_create(user=request.user)
            print(f"Authenticated user: {request.user}, Cart ID: {cart.id}")
        
        else:
            # Guest user cart
            guest_token = request.headers.get('Guest-Token')
            if not guest_token:
                raise NotAuthenticated("Guest token is required for guest users.")
            
            cart, _ = Cart.objects.get_or_create(session_id=guest_token)
            print(f"Guest user with token: {guest_token}, Cart ID: {cart.id}")
        
        return cart



