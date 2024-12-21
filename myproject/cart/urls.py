
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from users.views import CreditCardListCreateView, CreditCardListView
from django.urls import path


router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/', UserOrdersView.as_view(), name='user-orders'),
    path('orders/latest/', LatestOrderView.as_view(), name='latest-order'),
    path('cards/', CreditCardListCreateView.as_view(), name='credit-card-list'),
    path('credit-cards/', CreditCardListView.as_view(), name='credit-cards'),
    path('api/cart/fetch-invoices/', fetch_invoices, name='fetch_invoices'),
    path('api/cart/download-invoice-pdf/<int:order_id>/', download_invoice_pdf, name='download_invoice_pdf'),
    path('api/cart/fetch-invoice/<int:order_id>/', fetch_invoice_by_id, name='fetch_invoice_by_id'),
    path('api/cart/cancel-order/<int:order_id>/', cancel_order, name='cancel_order'),
    path('api/cart/request-refund/<int:order_item_id>/', request_refund, name='request_refund'),
    path('api/cart/approve-refund/<int:refund_id>/', approve_refund, name='approve_refund'),
    path('api/cart/deny-refund/<int:refund_id>/', deny_refund, name='deny_refund'),
    path('api/cart/refunds/', fetch_refunds, name='fetch_refunds'),
    path('api/revenue-profit-analysis/', RevenueProfitAnalysisView.as_view(), name='revenue-profit-analysis'),
    path('add-to-cart-from-wishlist/', AddToCartFromWishlistView.as_view(), name='add-to-cart-from-wishlist'),
]
