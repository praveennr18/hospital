from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'doctor'

class IsPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'patient'

class IsDoctorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['doctor', 'admin']

class IsAdminOrDoctor(permissions.BasePermission):
    """Permission for admin or doctor users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'doctor']

class IsPatientOrReadOnly(permissions.BasePermission):
    """Permission for patients to access their own data or read-only for others."""
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            if request.user.role == 'patient':
                return True
            elif request.user.role in ['admin', 'doctor'] and request.method in permissions.SAFE_METHODS:
                return True
        return False

class IsPatientOrDoctor(permissions.BasePermission):
    """Permission for patients or doctors."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['patient', 'doctor']