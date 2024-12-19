from django.urls import path
from .views import *


urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('assign-role/', AssignRoleView.as_view(), name='assign-role'),
    path('profile/', ProfileDetailView.as_view(), name='profile-detail'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
]
