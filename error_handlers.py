
# Basic Error Handler Implementation
# This file provides basic error handling utilities

import logging
import sys
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom exception for API-related errors"""
    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class ValidationError(Exception):
    """Custom exception for validation errors"""
    def __init__(self, message, field=None):
        self.message = message
        self.field = field
        super().__init__(self.message)

def handle_errors(func):
    """Decorator to handle errors in functions"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except APIError as e:
            logger.error(f"API Error in {func.__name__}: {e.message}")
            raise
        except ValidationError as e:
            logger.error(f"Validation Error in {func.__name__}: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            raise APIError(f"Internal server error: {str(e)}", 500)
    return wrapper

def log_error(error, context=""):
    """Log error with context"""
    logger.error(f"{context}: {str(error)}")

