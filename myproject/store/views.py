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
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
     product_id = self.request.query_params.get('product_id')
     if product_id:
        queryset = Review.objects.filter(is_approved=True, product_id=product_id)
        print(f"Filtered QuerySet: {queryset}")  # Debugging
        return queryset
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
    
