from django.shortcuts import render

# Create your views here.
#08/11/2024
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Review, Purchase
from .serializers import ReviewSerializer

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
