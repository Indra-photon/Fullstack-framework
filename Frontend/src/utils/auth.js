import axios from 'axios';
import store from '../store/store';
import { login, logout } from '../store/authSlice';

export const refreshTokens = async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/users/refresh-token`,
      {},
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      // If token refresh is successful, fetch user data again
      const userResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/users/me`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (userResponse.data.success) {
        // Update user data in Redux store
        store.dispatch(login(userResponse.data.data));
        return true;
      }
    }
    
    // If refresh fails, log out
    store.dispatch(logout());
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    store.dispatch(logout());
    return false;
  }
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const state = store.getState();
  return state.auth.status;
};

// Wrapper function for API calls that handles token refresh
export const apiCallWithTokenRefresh = async (apiCall) => {
  try {
    return await apiCall();
  } catch (error) {
    // If unauthorized, try to refresh token
    if (error.response?.status === 401) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        // Retry the original API call
        return await apiCall();
      }
    }
    throw error;
  }
};