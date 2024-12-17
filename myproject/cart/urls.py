
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from users.views import CreditCardListCreateView, CreditCardListView


router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/', UserOrdersView.as_view(), name='user-orders'),
    path('orders/latest/', LatestOrderView.as_view(), name='latest-order'),
    path('cards/', CreditCardListCreateView.as_view(), name='credit-card-list'),
    path('credit-cards/', CreditCardListView.as_view(), name='credit-cards'),
]
