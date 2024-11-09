from django.contrib import admin
from .models import Product, Review, Purchase
# Register your models here.


#08/11/2024

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'is_approved')
    actions = ['approve_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, "Selected reviews have been approved.")
    approve_reviews.short_description = "Approve selected reviews"

admin.site.register(Product)
admin.site.register(Purchase)
