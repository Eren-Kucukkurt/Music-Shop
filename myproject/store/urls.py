from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


# Create a router and register the ProductViewSet with it
router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'reviews', ReviewViewSet)

# Include the router-generated URLs in urlpatterns
urlpatterns = [
    path('api/', include(router.urls)),
    path('api/add-product/', AddProductView.as_view(), name='add-product'),
    path('api/admin-reviews/', AdminReviewView.as_view(), name='admin-reviews'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/update-discount/', UpdateDiscountView.as_view(), name='update-discount'),
]
