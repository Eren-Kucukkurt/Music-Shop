

from store.models import Product
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *
from store.models import *
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from users.models import *
from users.serializers import *
from users.utils import get_fernet
from .tasks import *
from rest_framework.exceptions import NotAuthenticated
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import HttpResponse
import os
from django.utils import timezone
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from django.db.models.functions import TruncDay
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem
from store.models import Product
from rest_framework import status

class CartViewSet(viewsets.ViewSet):
    
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    
    def add_item(self, request):
        
        """POST /cart/add_item/ - Add an item to the cart."""

        #print(f"request.data: {request.data}")
        
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        #print(f"add_item called with product_id={product_id}, quantity={quantity}")

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
            

            cart, created = Cart.objects.get_or_create(user=request.user)

            #print(f"Authenticated user: {request.user}, Cart ID: {cart.id}")
        
        else:
            

            guest_token = request.headers.get('Guest-Token')
            
            #print(f"Guest token: {guest_token}")

            if not guest_token:
                raise NotAuthenticated("Guest token is required for guest users.")
            
            cart, created = Cart.objects.get_or_create(session_id=guest_token)

            """
            if created:
                print(f"Guest Cart created with token: {guest_token}")
            else:
                print(f"Guest Cart retrieved with token: {guest_token}")
            """

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    
    @action(detail=True, methods=['post'])
    def update_item(self, request, pk=None):
        
        """POST /cart/<product_id>/update_item/ - Update item quantity"""
        
        quantity = request.data.get('quantity')
        if not quantity:
            return Response({'error': 'Quantity is required'}, status=status.HTTP_400_BAD_REQUEST)

        #print(f"update_item called with pk={pk}")

        cart = self.get_cart(request)
        #print(f"cart: {cart}")

        cart_item = get_object_or_404(CartItem, id=pk, cart=cart)
        #print(f"cart_item: {cart_item}")

        # Update the quantity, ensuring it does not exceed the product's stock
        cart_item.quantity = min(quantity, cart_item.product.quantity_in_stock)
        cart_item.save()
        return Response({'message': 'Item updated successfully'})

    
    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):

        if (request.method == 'OPTIONS'):
            return Response({'message': 'Options request received'})
        
        """POST /cart/<product_id>/remove_item/ - Remove an item from the cart"""

        #print(f"remove_item called with pk={pk}")
        cart = self.get_cart(request)
        
        """
        print(f"cart: {cart}")

        print(f"cart.id: {cart.id}")

        print("Existing cart items in the database:")
        
        for item in CartItem.objects.all():
           print(f"CartItem ID: {item.id}, Cart ID: {item.cart.id}, Product ID: {item.product.id}, Quantity: {item.quantity}")
        """

        # Retrieve the CartItem directly using pk
        cart_item = get_object_or_404(CartItem, id=pk, cart=cart)
        
        #print(f"cart_item: {cart_item}")
        

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
            #print(f"Authenticated user: {request.user}, Cart ID: {cart.id}")
        
        else:
            
            # Guest user cart
            guest_token = request.headers.get('Guest-Token')
            #print(f"Guest token: {guest_token}")

            if not guest_token:
                raise NotAuthenticated("Guest token is required for guest users.")
            
            cart, created = Cart.objects.get_or_create(session_id=guest_token)

            """
            if created:
                print(f"Guest Cart created with token: {guest_token}")
            else:
                print(f"Guest Cart retrieved with token: {guest_token}")
            """

        return cart



    @action(detail=False, methods=['post'])
    def merge_cart(self, request):
        
        """POST /cart/merge_cart/ - Merge guest cart into user's cart"""
        
        if not request.user.is_authenticated:
            return Response({'error': 'User must be logged in to merge carts'}, status=status.HTTP_401_UNAUTHORIZED)

        guest_token = request.headers.get('Guest-Token')

        if not guest_token:
            return Response({'error': 'Guest token is required for cart merging'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Retrieve the guest cart using the session ID
            guest_cart = Cart.objects.get(session_id=guest_token)
            
            print(f"Guest cart ID to be merged: {guest_cart.id}")

        except Cart.DoesNotExist:
            return Response({'error': 'Guest cart not found'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve or create the logged-in user's cart
        user_cart, _ = Cart.objects.get_or_create(user=request.user)

        # Merge items from the guest cart into the user's cart
        for guest_item in guest_cart.items.all():
            
            user_item, created = CartItem.objects.get_or_create(cart=user_cart, product=guest_item.product)
            
            if created:
                user_item.quantity = guest_item.quantity

            else:
                user_item.quantity += guest_item.quantity

            # Ensure the quantity does not exceed the product's stock
            user_item.quantity = min(user_item.quantity, user_item.product.quantity_in_stock)

            user_item.save()

        # Delete the guest cart after merging
        guest_cart.delete()

        return Response({'message': 'Carts merged successfully'}, status=status.HTTP_200_OK)



class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            # Extract credit card data from request
            card_data = request.data.get('credit_card', {})
            use_saved_card = card_data.get('use_saved_card', False)
            save_new_card = card_data.get('save_new_card', False)
            card_name = card_data.get('card_name', '')
            card_number = card_data.get('card_number', '')
            expiry_date = card_data.get('expiry_date', '')
            cvv = card_data.get('cvv', '')

            # Fetch the user's cart and cart items
            cart = Cart.objects.get(user=user)
            cart_items = CartItem.objects.filter(cart=cart)

            if not cart_items.exists():
                return Response({"detail": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

            # Handle payment validation (mocked here)
            if use_saved_card:
                card_id = card_data.get('card_id')
                try:
                    saved_card = CreditCard.objects.get(id=card_id, user=user)
                    card_number = saved_card.get_decrypted_card_number()
                    expiry_date = saved_card.get_decrypted_expiry_date()
                    cvv = saved_card.get_decrypted_cvv()
                except CreditCard.DoesNotExist:
                    return Response({"detail": "Saved card not found"}, status=status.HTTP_400_BAD_REQUEST)
            elif not all([card_number, expiry_date, cvv]):
                return Response({"detail": "Card details are incomplete"}, status=status.HTTP_400_BAD_REQUEST)

            # Simulate successful payment validation (mocked)
            payment_successful = True  # In a real app, integrate payment gateway

            if not payment_successful:
                return Response({"detail": "Payment failed"}, status=status.HTTP_400_BAD_REQUEST)

            # Initialize total price
            total_price = Decimal(0.00)

            # Create the Order
            order = Order.objects.create(
                user=user,
                total_price=total_price,
                status="PROCESSING",
            )

            # Create OrderItems and deduct stock
            product_ids = []
            for item in cart_items:
                product = item.product
                discounted_price = product.get_discounted_price()

                # Save order item with the discounted price and snapshot product details
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    product_image=product.image,
                    product_price=product.price,
                    quantity=item.quantity,
                    price=discounted_price * item.quantity,
                )

                # Deduct product stock
                product.quantity_in_stock -= item.quantity
                product.save()

                # Track product IDs for the delivery
                product_ids.append(product.id)

                # Create Purchase entry
                Purchase.objects.create(
                    user=user,
                    product=product,
                    quantity=item.quantity,
                )

                total_price += discounted_price * item.quantity

            # Update order total price
            order.total_price = total_price
            order.save()

            # Save new credit card if requested
            if save_new_card and card_number and expiry_date and cvv and card_name:
                fernet = get_fernet()
                CreditCard.objects.create(
                    user=user,
                    card_name=card_name,
                    encrypted_card_number=card_number,  # pass raw number
                    encrypted_expiry_date=expiry_date,  # pass raw expiry date
                    encrypted_cvv=cvv,                  # pass raw CVV
                    last4=card_number[-4:],
                )

                print("New card saved successfully")

            # Clear the cart
            cart_items.delete()

            # Automatically create a delivery entry
            profile = user.profile
            delivery = Delivery.objects.create(
                order=order,
                customer_name=f"{profile.first_name} {profile.last_name}",
                delivery_address=profile.home_address,
                status='PENDING',
            )
            # Link products to the delivery
            delivery.products.set(Product.objects.filter(id__in=product_ids))

            # Serialize and return the order with its items
            serializer = OrderSerializer(order, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Cart.DoesNotExist:
            return Response({"detail": "Cart not found"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        

class UserOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all orders for the authenticated user
        orders = Order.objects.filter(user=request.user).order_by('-created_at')

        serializer = OrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)


class LatestOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            order = Order.objects.filter(user=request.user).latest('created_at')

            serializer = OrderSerializer(order,context={'request': request}) 
            send_order_confirmation_email(user.email, order.id)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response({"detail": "No orders found."}, status=404)

from datetime import datetime

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_invoices(request):
    """
    Fetch orders between two dates.
    """
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    if not start_date or not end_date:
        return Response({'error': 'Start date and end date are required.'}, status=400)

    try:
        start_date = datetime.fromisoformat(start_date)
        end_date = datetime.fromisoformat(end_date)
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    orders = Order.objects.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
    serializer = OrderSerializer(orders, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_invoice_by_id(request, order_id):
    """
    Fetch a specific invoice by order ID.
    """
    try:
        order = Order.objects.get(id=order_id)
        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=404)

@api_view(['GET'])

def download_invoice_pdf(request, order_id):
    """
    Generate and download PDF invoice for a specific order.
    """
    from .utils import generate_invoice_pdf

    try:
        order = Order.objects.get(id=order_id)
        pdf_path = generate_invoice_pdf(order)
        with open(pdf_path, 'rb') as pdf_file:
            response = HttpResponse(pdf_file.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="invoice_{order_id}.pdf"'
        os.remove(pdf_path)  # Clean up
        return response
    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    """
    Cancel an order if it is in the PROCESSING state.
    """
    try:
        order = Order.objects.get(id=order_id, user=request.user)

        if order.status != 'PROCESSING':
            return Response({'error': 'Order cannot be canceled as it is not in the PROCESSING state.'}, status=400)

        order.cancel_order()
        return Response({'success': f'Order {order_id} canceled successfully.'})

    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=404)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_refund(request, order_item_id):
    """
    Request a refund for a specific order item.
    """
    try:
        order_item = OrderItem.objects.get(id=order_item_id, order__user=request.user)

        # Check if the refund window is still valid
        if (timezone.now() - order_item.order.created_at).days > 30:
            return Response({'error': 'Refund window has expired.'}, status=400)

        # Get quantity and reason from the request
        quantity = int(request.data.get('quantity', 0))
        reason = request.data.get('reason', '')

        # Validate refund quantity
        refundable_quantity = order_item.refundable_quantity()
        if quantity <= 0 or quantity > refundable_quantity:
            return Response({
                'error': f'Invalid return quantity. You can only refund up to {refundable_quantity} item(s).'
            }, status=400)

        # Create the refund request
        refund = Refund.objects.create(
            order_item=order_item,
            user=request.user,
            requested_quantity=quantity,
            reason=reason,
        )

        return Response({'success': f'Refund request for {quantity} item(s) submitted.', 'refund_id': refund.id})

    except OrderItem.DoesNotExist:
        return Response({'error': 'Order item not found.'}, status=404)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_refund(request, refund_id):
    """
    Approve a refund request and notify the user via email.
    """
    try:
        refund = Refund.objects.get(id=refund_id)
        if refund.status != 'PENDING':
            return Response({'error': 'Refund request is not pending.'}, status=400)

        refund.approve()

        # Trigger email notification in the background
        send_refund_approval_email(refund.id)

        return Response({'success': 'Refund approved.', 'refund_amount': refund.refund_amount})
    except Refund.DoesNotExist:
        return Response({'error': 'Refund not found.'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deny_refund(request, refund_id):
    """
    Deny a refund request.
    """
    try:
        refund = Refund.objects.get(id=refund_id)
        if refund.status != 'PENDING':
            return Response({'error': 'Refund request is not pending.'}, status=400)

        refund.deny()
        return Response({'success': 'Refund denied.'})
    except Refund.DoesNotExist:
        return Response({'error': 'Refund not found.'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_refunds(request):
    """
    Fetch all refund requests with optional status filtering.
    Only accessible by Sales Managers.
    """
    if not request.user.profile.role == 'SALES_MANAGER':
        return Response({'error': 'You do not have permission to access this resource.'}, status=403)

    status = request.query_params.get('status')  # Filter by status if provided
    refunds = Refund.objects.all()

    if status:
        refunds = refunds.filter(status=status)

    serializer = RefundSerializer(refunds, many=True)
    return Response(serializer.data)

class RevenueProfitAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Filter by date range and exclude canceled orders
        order_items = OrderItem.objects.filter(
            order__created_at__range=[start_date, end_date]
        ).exclude(order__status="CANCELED")

        # Adjust calculations for refunded quantities
        revenue = (
            order_items.aggregate(
                total_revenue=Sum(
                    ExpressionWrapper(
                        F('price') * (F('quantity') - F('refunded_quantity')),
                        output_field=DecimalField(),
                    )
                )
            )['total_revenue']
            or 0
        )

        total_cost = (
            order_items.aggregate(
                total_cost=Sum(
                    ExpressionWrapper(
                        F('product__cost') * (F('quantity') - F('refunded_quantity')),
                        output_field=DecimalField(),
                    )
                )
            )['total_cost']
            or 0
        )

        profit = revenue - total_cost

        # Group data by date, accounting for refunds
        revenue_by_date = (
            order_items.annotate(date=TruncDay('order__created_at'))
            .values('date')
            .annotate(
                revenue=Sum(
                    ExpressionWrapper(
                        F('price') * (F('quantity') - F('refunded_quantity')),
                        output_field=DecimalField(),
                    )
                ),
                cost=Sum(
                    ExpressionWrapper(
                        F('product__cost') * (F('quantity') - F('refunded_quantity')),
                        output_field=DecimalField(),
                    )
                ),
                refunds=Sum(F('refunded_quantity') * F('price')),
            )
            .order_by('date')
        )

        return Response({
            "total_revenue": revenue,
            "total_profit": profit,
            "revenue_by_date": revenue_by_date,
        })



class AddToCartFromWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch product and check stock
            product = Product.objects.get(id=product_id)
            if product.quantity_in_stock <= 0:
                return Response({"error": "Product is out of stock."}, status=status.HTTP_400_BAD_REQUEST)

            # Get or create user's cart
            cart, created = Cart.objects.get_or_create(user=request.user)

            # Add product to cart
            cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
            if not created:
                cart_item.quantity += 1
                cart_item.save()

            return Response({"message": "Product added to cart."}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)



class DeliveryListView(APIView):
    def get(self, request):
        """
        Retrieve all deliveries with product details and customer information.
        """
        deliveries = Delivery.objects.all()
        serializer = DeliverySerializer(deliveries, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """
        Update the delivery status or address.
        """
        try:
            delivery = Delivery.objects.get(pk=pk)
        except Delivery.DoesNotExist:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DeliverySerializer(delivery, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DeliveryStatusUpdateView(APIView):
    """
    View to update the delivery status and the corresponding order status.
    """
    def put(self, request, pk):
        try:
            # Get the delivery object
            delivery = Delivery.objects.get(pk=pk)
        except Delivery.DoesNotExist:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update the delivery status
        new_status = request.data.get("status")
        if new_status not in ["PENDING", "IN-TRANSIT", "DELIVERED", "CANCELED"]:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

        delivery.status = new_status
        delivery.save()

        # Update the corresponding order status
        order = delivery.order
        if order:
            if new_status == "PENDING":
                order.status = "PROCESSING"
            elif new_status == "IN-TRANSIT":
                order.status = "IN-TRANSIT"
            elif new_status == "DELIVERED":
                order.status = "DELIVERED"
            elif new_status == "CANCELED":
                order.status = "CANCELED"

            order.save()

        # Return the updated delivery data
        serializer = DeliverySerializer(delivery, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)    