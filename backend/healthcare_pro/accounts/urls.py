from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import auth_views, user_views, admin_views

urlpatterns = [
    # Authentication endpoints
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoints
    path('profile/', user_views.ProfileView.as_view(), name='profile'),
    path('change-password/', auth_views.ChangePasswordView.as_view(), name='change_password'),
    
    # Admin endpoints - User Management
    path('admin/users/', admin_views.UserListView.as_view(), name='admin_user_list'),
    path('admin/users/create/', admin_views.AdminCreateUserView.as_view(), name='admin_create_user'),
    path('admin/users/<uuid:pk>/', admin_views.AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<uuid:pk>/reset-password/', admin_views.AdminResetPasswordView.as_view(), name='admin_reset_password'),
    
    # Admin endpoints - Complete Registration
    path('admin/register/patient/', admin_views.admin_register_patient, name='admin_register_patient'),
    path('admin/register/doctor/', admin_views.admin_register_doctor, name='admin_register_doctor'),
    
    # Admin endpoints - Dashboard & Management
    path('admin/dashboard/stats/', admin_views.admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/doctors/list/', admin_views.admin_doctors_list, name='admin_doctors_list'),
    path('admin/patients/list/', admin_views.admin_patients_list, name='admin_patients_list'),
]