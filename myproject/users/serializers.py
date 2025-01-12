from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import *

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add custom claims
        data['role'] = self.user.profile.role  # Add role from the Profile model
        data['username'] = self.user.username  # Add username if needed

        return data
    
# users/serializers.py
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['first_name', 'last_name', 'role', 'tax_id', 'home_address']
        read_only_fields = ['tax_id']





class CreditCardSerializer(serializers.ModelSerializer):
    """Serializer for CreditCard model."""

    # Write-only fields for card inputs
    card_number = serializers.CharField(write_only=True, required=True)
    expiry_date = serializers.CharField(write_only=True, required=True)
    cvv = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CreditCard
        fields = ['id', 'card_name', 'last4', 'created_at', 'card_number', 'expiry_date', 'cvv']
        read_only_fields = ['id', 'last4', 'created_at']

    def create(self, validated_data):
        """Override create to encrypt card details and save to the database."""
        from cryptography.fernet import Fernet
        from django.conf import settings

        # Retrieve and remove sensitive card fields
        card_number = validated_data.pop('card_number')
        expiry_date = validated_data.pop('expiry_date')
        cvv = validated_data.pop('cvv')

        # Get Fernet instance for encryption
        fernet = Fernet(settings.SECRET_KEY_FERNET)

        # Encrypt sensitive fields
        encrypted_card_number = fernet.encrypt(card_number.encode()).decode()
        encrypted_expiry_date = fernet.encrypt(expiry_date.encode()).decode()
        encrypted_cvv = fernet.encrypt(cvv.encode()).decode()

        # Save the CreditCard instance
        credit_card = CreditCard.objects.create(
            encrypted_card_number=encrypted_card_number,
            encrypted_expiry_date=encrypted_expiry_date,
            encrypted_cvv=encrypted_cvv,
            last4=card_number[-4:],  # Set the last 4 digits
            **validated_data  # Includes card_name and other non-sensitive data
        )

        return credit_card