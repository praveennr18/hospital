import logging
import time
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('healthcare_app')

class APILoggingMiddleware(MiddlewareMixin):
    """
    Simple middleware to log API requests
    """
    
    def process_request(self, request):
        # Start timing the request
        request.start_time = time.time()
        return None
    
    def process_response(self, request, response):
        # Calculate request duration
        duration = time.time() - getattr(request, 'start_time', time.time())
        
        # Get user information with role
        user_info = 'Anonymous'
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_role = getattr(request.user, 'role', 'unknown')
            user_info = f"{request.user.email} ({user_role})"
        
        # Log only API requests (those starting with /api/)
        if request.path.startswith('/api/'):
            # Simple log format with user role
            log_message = f"{request.method} {request.path} - Status: {response.status_code} - User: {user_info} - Duration: {duration*1000:.0f}ms"
            
            # Log based on status code
            if response.status_code >= 500:
                logger.error(log_message)
            elif response.status_code >= 400:
                logger.warning(log_message)
            else:
                logger.info(log_message)
        
        return response