from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet


# Create a router and register the ProductViewSet with it
router = DefaultRouter()
router.register(r'products', ProductViewSet)

# Include the router-generated URLs in urlpatterns
urlpatterns = [
    path('api/', include(router.urls)),
]
