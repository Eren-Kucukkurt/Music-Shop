from django.contrib import admin
from .models import Product, Review, Purchase


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'model', 'price', 'quantity_in_stock', 'total_sale', 'popularity')
    list_filter = ('category', 'warranty_status')
    search_fields = ('name', 'model', 'serial_number', 'category')
    ordering = ('-popularity',)  # Default sorting by popularity
    list_editable = ('price', 'quantity_in_stock')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'is_approved')
    actions = ['approve_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, "Selected reviews have been approved.")
    approve_reviews.short_description = "Approve selected reviews"


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'purchase_date')
    list_filter = ('purchase_date',)
    search_fields = ('user__username', 'product__name', 'product__model')
