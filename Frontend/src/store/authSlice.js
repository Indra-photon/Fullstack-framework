import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// // Create async thunk for updating user after payment
// export const updateUserAfterPayment = createAsyncThunk(
//   'auth/updateUserAfterPayment',
//   async (userData, { rejectWithValue }) => {
//     try {
//       // In a real implementation, you might want to fetch the latest user data
//       // from the server after a payment to ensure it's up to date
//       return userData;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to update user data');
//     }
//   }
// );

const initialState = {
  status: false,
  userData: null,
  token: null,
  tokenInfo: {
    accessTokenExpiry: null,
    refreshTokenExpiry: null,
    loginTime: null,
    lastRefreshTime: null,
    warningShown: false,
  },
  paymentStatus: {
    loading: false,
    error: null,
    success: false,
    lastUpdated: null,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload.user || action.payload;

      // Store token info
      if (action.payload.accessTokenExpiry) {
        state.tokenInfo = {
          accessTokenExpiry: action.payload.accessTokenExpiry,
          refreshTokenExpiry: action.payload.refreshTokenExpiry,
          loginTime: action.payload.loginTime,
          lastRefreshTime: null,
          warningShown: false,
        };
      }

      // If a token is provided in the payload, store it
      if (action.payload.token || action.payload.accessToken) {
        state.token = action.payload.token || action.payload.accessToken;
      }
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      state.token = null;
      state.tokenInfo = initialState.tokenInfo;
      state.paymentStatus = initialState.paymentStatus;
    },
    updateUserData: (state, action) => {
      state.userData = {
        ...state.userData,
        ...action.payload,
      };
    },
    updateTokenInfo: (state, action) => {
      state.tokenInfo = {
        ...state.tokenInfo,
        ...action.payload,
        warningShown: false,
      };
    },
    setWarningShown: (state, action) => {
      state.tokenInfo.warningShown = action.payload;
    },
    refreshTokenSuccess: (state, action) => {
      // Update token info after successful refresh
      if (action.payload.accessTokenExpiry) {
        state.tokenInfo = {
          ...state.tokenInfo,
          accessTokenExpiry: action.payload.accessTokenExpiry,
          refreshTokenExpiry: action.payload.refreshTokenExpiry,
          lastRefreshTime: action.payload.refreshTime,
          warningShown: false,
        };
      }

      // Update token if provided
      if (action.payload.accessToken) {
        state.token = action.payload.accessToken;
      }
    },
    // Reset payment status after handling
    resetPaymentStatus: (state) => {
      state.paymentStatus = initialState.paymentStatus;
    },
    // For direct token updates (if needed)
    updateUserTokens: (state, action) => {
      if (state.userData && state.userData.tokens) {
        state.userData.tokens.balance = action.payload.newBalance;
        // You might want to update other token-related fields
      }
    },
    // For direct subscription updates (if needed)
    updateUserSubscription: (state, action) => {
      if (state.userData && state.userData.subscription) {
        state.userData.subscription = {
          ...state.userData.subscription,
          ...action.payload,
        };
      }
    },
  },
});

export const {
  login,
  logout,
  updateUserData,
  resetPaymentStatus,
  updateUserTokens,
  updateUserSubscription,
  updateTokenInfo,
  setWarningShown,
  refreshTokenSuccess,
} = authSlice.actions;

export default authSlice.reducer;
