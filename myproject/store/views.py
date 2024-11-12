from django.shortcuts import render

# Create your views here.
#08/11/2024
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Review, Purchase, Product
from .serializers import ReviewSerializer
from .serializers import ProductSerializer
from .models import Cart, CartItem, Product
from .serializers import CartSerializer
from django_filters.rest_framework import DjangoFilterBackend


class IsPurchaser(permissions.BasePermission):
    """
    Custom permission to only allow users who have purchased the product to comment.
    """

    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return False

        # Check if the product has been purchased by the user
        product_id = request.data.get("product")
        if product_id is not None:
            return Purchase.objects.filter(user=request.user, product_id=product_id).exists()
        return False

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsPurchaser]

    def get_queryset(self):
        """
        Filter reviews to only show approved ones.
        """
        return Review.objects.filter(is_approved=True)

    def perform_create(self, serializer):
        # Save the review with the logged-in user and set is_approved=False by default
        serializer.save(user=self.request.user, is_approved=False)
        return Response({"message": "Your review has been submitted for approval."}, status=status.HTTP_201_CREATED)

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description', 'model']
    filterset_fields = {
        'price': ['gte', 'lte'],  # Allows filtering by price range (greater than or equal, less than or equal)
        'quantity_in_stock': ['gt'],  # Filter for products that are in stock
        'warranty_status': ['exact'],  # Filter by exact warranty status
    }
    ordering_fields = ['price']  # Specify fields that can be used for ordering


class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        # Validate product existence
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        # Validate stock
        if product.quantity_in_stock < quantity:
            return Response({"error": "Not enough stock available"}, status=status.HTTP_400_BAD_REQUEST)

        # For logged-in users, retrieve or create their cart in the database
        if request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=request.user)
            cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product=product)
            cart_item.quantity += quantity
            cart_item.quantity = min(cart_item.quantity, product.quantity_in_stock)  # Cap quantity at stock level
            cart_item.save()
            serializer = CartSerializer(cart)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # For guest users, handle cart items in the session
        session_cart = request.session.get('cart', {})
        if str(product_id) in session_cart:
            session_cart[str(product_id)] += quantity
        else:
            session_cart[str(product_id)] = quantity
        request.session['cart'] = session_cart

        return Response({"message": "Item added to cart"}, status=status.HTTP_200_OK)
