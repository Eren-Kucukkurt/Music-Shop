from django.contrib import admin

from .models import *

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    search_fields = ('user__username', 'role')

@admin.register(CreditCard)
class CreditCardAdmin(admin.ModelAdmin):
    list_display = ('user', 'card_name', 'created_at')  # Avoid displaying encrypted fields
    readonly_fields = ('created_at',)