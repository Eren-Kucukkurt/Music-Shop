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

# Serializer for User Registration
class RegisterSerializer(Serializer):
    username = CharField(max_length=150)
    password = CharField(write_only=True, required=True)
    email = EmailField(required=True)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
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
