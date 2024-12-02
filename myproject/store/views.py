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

        # Allow rating submission without a comment
        serializer.save(user=self.request.user, is_approved=False)


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
    permission_classes = [permissions.IsAdminUser]

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
        Approve or reject a review based on the provided ID and action.
        """
        review_id = request.data.get('review_id')
        is_approved = request.data.get('is_approved')

        if review_id is None or is_approved is None:
            return Response(
                {"error": "review_id and is_approved are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            review = Review.objects.get(id=review_id)
            review.is_approved = is_approved
            review.save()
            return Response(
                {"message": f"Review {'approved' if is_approved else 'rejected'} successfully."},
                status=status.HTTP_200_OK,
            )
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)