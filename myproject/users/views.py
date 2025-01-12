from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.serializers import Serializer, CharField, EmailField
from rest_framework.permissions import AllowAny
## import the cart class
from cart.models import Cart, CartItem
from .models import *
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from django.utils.crypto import get_random_string

class LoginView(APIView):
    

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            return Response({"error": "Invalid credentials"}, status=400)


class RegisterSerializer(Serializer):
    username = CharField(max_length=150)
    password = CharField(write_only=True, required=True)
    email = EmailField(required=True)

    def create(self, validated_data):
        # Create the user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Generate a unique 10-digit Tax ID
        tax_id = get_random_string(length=10, allowed_chars='0123456789')

        # Create the user's profile with the generated Tax ID
        Profile.objects.create(
            user=user,
            role='CUSTOMER',
            tax_id=tax_id
        )

        return user


# Registration View
class RegisterView(APIView):
    permission_classes = [AllowAny]  # Allow anyone to register

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AssignRoleView(APIView):
    """
    API endpoint for admins to assign roles to users.
    Only admin users can access this endpoint.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        username = request.data.get('username')
        role = request.data.get('role')

        if not username or not role:
            return Response({"error": "Username and role are required."}, status=400)

        if role not in ['PRODUCT_MANAGER', 'SALES_MANAGER']:
            return Response({"error": "Invalid role. Allowed roles are PRODUCT_MANAGER or SALES_MANAGER."}, status=400)

        try:
            user = User.objects.get(username=username)
            # Update the user's profile with the new role
            user.profile.role = role
            user.profile.save()
            return Response({"message": f"Role {role} assigned to user {username}."}, status=200)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)
        


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CreditCardListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Fetch all saved credit cards for the logged-in user."""
        cards = CreditCard.objects.filter(user=request.user)
        serializer = CreditCardSerializer(cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Save a new credit card."""
        card_number = request.data.get('card_number')
        expiry_date = request.data.get('expiry_date')
        card_name = request.data.get('card_name', 'Unnamed Card')
        cvv = request.data.get('cvv')

        if not card_number or not expiry_date or not cvv:
            return Response({"error": "Card number, expiry date, and CVV are required."}, status=400)

        try:
            # Create and save the credit card
            new_card = CreditCard(
                user=request.user,
                card_name=card_name,
                encrypted_card_number=card_number,
                encrypted_expiry_date=expiry_date,
                encrypted_cvv=cvv
            )
            new_card.full_clean()  # Validate card details
            new_card.save()

            serializer = CreditCardSerializer(new_card)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class CreditCardListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve all credit cards for the authenticated user."""
        credit_cards = CreditCard.objects.filter(user=request.user)
        serializer = CreditCardSerializer(credit_cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class ProfileDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user.profile
    
class ProfileUpdateView(APIView):
    def put(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)