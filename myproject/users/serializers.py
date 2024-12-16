from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add custom claims
        data['role'] = self.user.profile.role  # Add role from the Profile model
        data['username'] = self.user.username  # Add username if needed

        return data
