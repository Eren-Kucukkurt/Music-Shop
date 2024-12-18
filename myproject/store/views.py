from django.shortcuts import render

# Create your views here.
#08/11/2024
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from .models import Review, Purchase, Product
from .serializers import ReviewSerializer
from .serializers import ProductSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView, UpdateAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers


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
class ReviewPagination(PageNumberPagination):
    page_size = 5  # Number of reviews per page
    page_size_query_param = 'page_size'  # Optional: Allows client to specify page size
    max_page_size = 50  # Optional: Maximum limit for page size
    
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = ReviewPagination

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return Review.objects.filter(product_id=product_id, is_approved=True)
        return Review.objects.filter(is_approved=True)

    def perform_create(self, serializer):
        product_id = self.request.data.get("product")
        if not Purchase.objects.filter(user=self.request.user, product_id=product_id).exists():
            raise PermissionDenied("You can only leave reviews for products you have purchased.")

        # Check if comment is explicitly None
        comment = self.request.data.get("comment")
        if comment is None or comment.strip() == "":
            is_approved = True  # Auto-approve if no comment
        else:
            is_approved = False  # Require approval if comment is provided

        # Save the review
        serializer.save(user=self.request.user, is_approved=is_approved)




class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ['name', 'description', 'model']
    filterset_fields = {
        'price': ['gte', 'lte'],  # Filter by price range
        'quantity_in_stock': ['gt'],  # Filter for products that are in stock
        'warranty_status': ['exact'],  # Filter by exact warranty status
    }
    ordering_fields = ['popularity', 'price']  # Support sorting by price and popularity
    

class AddProductView(APIView):
    """
    API endpoint to add a new product. Only accessible to admin users.
    """
   # permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminReviewView(APIView):
    """
    View for managing reviews by the admin.
    """
    permission_classes = [IsAuthenticated]  # Require authentication (can be replaced with IsAdminUser for stricter access)

    def get(self, request):
        """
        List all reviews with approval status.
        """
        reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Approve, reject (delete), or mark a review as pending based on the provided ID and action.
        """
        review_id = request.data.get('review_id')
        action = request.data.get('action')  # Expect 'approve', 'reject', or 'pending'

        if review_id is None or action not in ['approve', 'reject', 'pending']:
            return Response(
                {"error": "review_id and a valid action ('approve', 'reject', or 'pending') are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            review = Review.objects.get(id=review_id)

            if action == 'approve':
                review.is_approved = True
                review.save()
                return Response({"message": "Review approved successfully."}, status=status.HTTP_200_OK)

            elif action == 'reject':
                review.delete()  # Delete the review
                return Response({"message": "Review rejected and deleted successfully."}, status=status.HTTP_200_OK)

            elif action == 'pending':
                review.is_approved = False
                review.save()
                return Response({"message": "Review marked as pending."}, status=status.HTTP_200_OK)

        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

class ProductListView(ListAPIView):
    """
    Fetch products with optional search functionality.
    """
    print("ProductListView")
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    #permission_classes = [IsAuthenticated]
    def get_queryset(self):
        print("get_queryset")
        search_query = self.request.query_params.get('search', '')
        return self.queryset.filter(name__icontains=search_query)


class UpdateDiscountView(UpdateAPIView):
    """
    Update discount details for a specific product.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    from decimal import Decimal
from rest_framework.exceptions import ValidationError

def perform_update(self, serializer):
    data = self.request.data

    try:
        # Fetch and validate discount_percentage if present
        discount_percentage = data.get('discount_percentage', None)
        if discount_percentage is not None:
            discount_percentage = float(discount_percentage)
            if discount_percentage < 0 or discount_percentage > 100:
                raise ValidationError({'discount_percentage': 'Must be between 0 and 100.'})

        # Fetch and validate price if present
        price = data.get('price', None)
        if price is not None:
            price = float(price)
            if price <= 0:
                raise ValidationError({'price': 'Price must be greater than 0.'})

        # Validate discount dates if provided
        discount_start_date = data.get('discount_start_date')
        discount_end_date = data.get('discount_end_date')
        if discount_start_date and discount_end_date:
            if discount_start_date > discount_end_date:
                raise ValidationError({'discount_dates': 'End date must be after start date.'})

        # Save only the fields that were sent in the request
        serializer.save(
            discount_percentage=discount_percentage if discount_percentage is not None else serializer.instance.discount_percentage,
            discount_start_date=discount_start_date if discount_start_date is not None else serializer.instance.discount_start_date,
            discount_end_date=discount_end_date if discount_end_date is not None else serializer.instance.discount_end_date,
            price=price if price is not None else serializer.instance.price,
        )

    except ValueError as e:
        raise ValidationError({'error': str(e)})

