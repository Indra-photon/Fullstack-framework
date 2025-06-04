// import store from '../store/store';
// import { logout } from '../store/authSlice';
// import toast, { Toaster } from "react-hot-toast";

// export const handleApiError = async (error, customErrorHandler = null) => {
//   // If there's a custom error handler, try that first
//   if (customErrorHandler) {
//     const handled = await customErrorHandler(error);
//     if (handled) return;
//   }

//   // Default error handling
//   if (error.response) {
//     // The request was made and the server responded with a status code
//     switch (error.response.status) {
      
//       case 403: // Forbidden
//         toast.error('You do not have permission to perform this action.');
//         break;
      
//       case 404: // Not Found
//         toast.error('The requested resource could not be found.');
//         break;
      
//       case 500: // Internal Server Error
//         toast.error('An unexpected server error occurred. Please try again later.');
//         break;
      
//       default:
//         // Generic error message from backend or default message
//         const errorMessage = 
//           error.response.data?.message || 
//           error.response.data?.error || 
//           'An unexpected error occurred';
        
//         toast.error(errorMessage);
//     }
//   } else if (error.request) {
//     // The request was made but no response was received
//     toast.error('No response received from the server. Please check your internet connection.');
//   } else {
//     // Something happened in setting up the request
//     toast.error('Error setting up the request. Please try again.');
//   }

//   // Always log the full error for debugging
//   console.error('API Error:', error);
// };

// // Utility to wrap API calls with error handling
// export const safeApiCall = async (apiCall, customErrorHandler = null) => {
//   try {
//     return await apiCall();
//   } catch (error) {
//     await handleApiError(error, customErrorHandler);
//     throw error; // Re-throw to allow caller to handle if needed
//   }
// };

import store from '../store/store';
import { logout } from '../store/authSlice';
import toast from "react-hot-toast";

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
        // Just logout directly, no token refresh attempt
        store.dispatch(logout());
        toast.error('Your session has expired. Please log in again.');
        // Force redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        break;
      
      case 403: // Forbidden
        toast.error('You do not have permission to perform this action.');
        break;
      
      case 404: // Not Found
        toast.error('The requested resource could not be found.');
        break;
      
      case 422: // Unprocessable Entity (Validation errors)
        const validationMessage = 
          error.response.data?.message || 
          error.response.data?.error ||
          'Please check your input and try again.';
        toast.error(validationMessage);
        break;
      
      case 429: // Too Many Requests
        toast.error('Too many requests. Please wait a moment and try again.');
        break;
      
      case 500: // Internal Server Error
        toast.error('An unexpected server error occurred. Please try again later.');
        break;
      
      case 502: // Bad Gateway
        toast.error('Service temporarily unavailable. Please try again later.');
        break;
      
      case 503: // Service Unavailable
        toast.error('Service is currently unavailable. Please try again later.');
        break;
      
      default:
        // Generic error message from backend or default message
        const errorMessage = 
          error.response.data?.message || 
          error.response.data?.error || 
          `An unexpected error occurred (${error.response.status})`;
        
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
  console.error('API Error:', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method
  });
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

// Helper function to extract error message from response
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Helper function to check if error is a network error
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

// Helper function to check if error is a client error (4xx)
export const isClientError = (error) => {
  return error.response && error.response.status >= 400 && error.response.status < 500;
};

// Helper function to check if error is a server error (5xx)
export const isServerError = (error) => {
  return error.response && error.response.status >= 500;
};