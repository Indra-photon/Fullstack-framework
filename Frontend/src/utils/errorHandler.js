import { refreshTokens } from './auth';
import store from '../store/store';
import { logout } from '../store/authSlice';
import toast, { Toaster } from "react-hot-toast";

export const handleApiError = async (error, customErrorHandler = null) => {
  // If there's a custom error handler, try that first
  if (customErrorHandler) {
    const handled = await customErrorHandler(error);
    if (handled) return;
  }

  // Default error handling
  if (error.response) {
    // The request was made and the server responded with a status code
    switch (error.response.status) {
      case 401: // Unauthorized
        try {
          // Try to refresh tokens
          const refreshed = await refreshTokens();
          if (!refreshed) {
            // If refresh fails, force logout
            store.dispatch(logout());
            toast.error('Your session has expired. Please log in again.');
            window.location.href = '/login'; // Force redirect
          }
        } catch {
          store.dispatch(logout());
          toast.error('Authentication failed. Please log in again.');
          window.location.href = '/login';
        }
        break;
      
      case 403: // Forbidden
        toast.error('You do not have permission to perform this action.');
        break;
      
      case 404: // Not Found
        toast.error('The requested resource could not be found.');
        break;
      
      case 500: // Internal Server Error
        toast.error('An unexpected server error occurred. Please try again later.');
        break;
      
      default:
        // Generic error message from backend or default message
        const errorMessage = 
          error.response.data?.message || 
          error.response.data?.error || 
          'An unexpected error occurred';
        
        toast.error(errorMessage);
    }
  } else if (error.request) {
    // The request was made but no response was received
    toast.error('No response received from the server. Please check your internet connection.');
  } else {
    // Something happened in setting up the request
    toast.error('Error setting up the request. Please try again.');
  }

  // Always log the full error for debugging
  console.error('API Error:', error);
};

// Utility to wrap API calls with error handling
export const safeApiCall = async (apiCall, customErrorHandler = null) => {
  try {
    return await apiCall();
  } catch (error) {
    await handleApiError(error, customErrorHandler);
    throw error; // Re-throw to allow caller to handle if needed
  }
};