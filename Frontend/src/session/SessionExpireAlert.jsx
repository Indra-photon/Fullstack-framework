// import React, { useEffect, useState, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { refreshTokenSuccess, logout, setWarningShown } from '../store/authSlice';

// const SessionExpireAlert = () => {
//   const [showAlert, setShowAlert] = useState(false);
//   const [countdown, setCountdown] = useState(60); // 60 seconds warning
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const authStatus = useSelector(state => state.auth.status);
//   const tokenInfo = useSelector(state => state.auth.tokenInfo);
//   const warningTimerRef = useRef(null);
//   const countdownIntervalRef = useRef(null);
  
// useEffect(() => {
//   if (!authStatus || !tokenInfo?.accessTokenExpiry) {
//     // console.log('SessionExpireAlert: No auth or token info, returning');
//     return;
//   }
  
//   const checkTokenExpiry = () => {
//     const now = new Date().getTime();
//     const expiryTime = new Date(tokenInfo.accessTokenExpiry).getTime();
//     const timeUntilExpiry = expiryTime - now;
    
//     // console.log('SessionExpireAlert: Checking token expiry');
//     // console.log('Time until expiry:', Math.floor(timeUntilExpiry / 1000 / 60), 'minutes');
    
//     // Clear any existing timers
//     if (warningTimerRef.current) {
//       clearTimeout(warningTimerRef.current);
//     }
//     if (countdownIntervalRef.current) {
//       clearInterval(countdownIntervalRef.current);
//     }
    
//     // If token already expired, logout immediately
//     if (timeUntilExpiry <= 0) {
//       // console.log('Token already expired, logging out');
//       dispatch(logout());
//       navigate('/login');
//       return;
//     }
    
//     const warningTime = timeUntilExpiry - 60000; // Changed to 1 minute for testing
    
//     if (warningTime > 0) {
//       // console.log('Setting warning timer for:', warningTime / 1000, 'seconds');
//       // Set timer to show warning
//       warningTimerRef.current = setTimeout(() => {
//         // console.log('Warning timer triggered!');
//         setShowAlert(true);
//         dispatch(setWarningShown(true));
//         setCountdown(60); // Start from 60 seconds
        
//         // console.log('Starting countdown from 60 seconds');
//         // Start countdown
//         countdownIntervalRef.current = setInterval(() => {
//           setCountdown(prev => {
//             // console.log('Countdown:', prev);
//             if (prev <= 1) {
//               // Time's up - logout
//               // console.log('Countdown finished, logging out');
//               clearInterval(countdownIntervalRef.current);
//               dispatch(logout());
//               navigate('/login');
//               return 0;
//             }
//             return prev - 1;
//           });
//         }, 1000);
//       }, warningTime);
//     } else {
//       // Less than warning time remaining, show warning immediately
//       // console.log('Less than warning time remaining, showing warning immediately');
//       setShowAlert(true);
//       dispatch(setWarningShown(true));
      
//       // Calculate actual seconds remaining
//       const secondsRemaining = Math.max(Math.floor(timeUntilExpiry / 1000), 60);
//       // console.log('Setting countdown to:', Math.min(secondsRemaining, 60));
//       setCountdown(Math.min(secondsRemaining, 60)); // Cap at 60 seconds
      
//       // Start countdown
//       countdownIntervalRef.current = setInterval(() => {
//         setCountdown(prev => {
//           // console.log('Countdown:', prev);
//           if (prev <= 1) {
//             // console.log('Countdown finished, logging out');
//             clearInterval(countdownIntervalRef.current);
//             dispatch(logout());
//             navigate('/login');
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
//   };
  
//   checkTokenExpiry();
  
//   // Clean up timers on unmount
//   return () => {
//     // console.log('SessionExpireAlert: Cleaning up timers');
//     if (warningTimerRef.current) {
//       clearTimeout(warningTimerRef.current);
//     }
//     if (countdownIntervalRef.current) {
//       clearInterval(countdownIntervalRef.current);
//     }
//   };
// }, [authStatus, tokenInfo?.accessTokenExpiry, tokenInfo?.warningShown])


//   const handleStayLoggedIn = async () => {
//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/users/refresh-token`,
//         {},
//         { withCredentials: true }
//       );
      
//       if (response.data.success) {
//         const data = response.data.data;
        
//         // Update Redux with new token info
//         dispatch(refreshTokenSuccess({
//           accessToken: data.accessToken,
//           accessTokenExpiry: data.accessTokenExpiry,
//           refreshTokenExpiry: data.refreshTokenExpiry,
//           refreshTime: data.refreshTime
//         }));
        
//         // Hide alert and reset countdown
//         setShowAlert(false);
//         setCountdown(60);
//         dispatch(setWarningShown(false));
        
//         // Clear existing timers
//         if (countdownIntervalRef.current) {
//           clearInterval(countdownIntervalRef.current);
//         }
//       }
//     } catch (error) {
//       console.error('Failed to refresh session:', error);
//       dispatch(logout());
//       navigate('/login');
//     }
//   };
  
//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/login');
//   };
  
//   if (!showAlert) return null;
  
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//       <div className="bg-white rounded-xl p-6 max-w-md shadow-xl">
//         <h3 className="text-xl font-bold text-dark mb-4">Session Expiring Soon</h3>
//         <p className="text-gray-600 mb-6">
//           Your session will expire in {countdown} seconds. Would you like to stay logged in?
//         </p>
//         <div className="flex justify-between">
//           <button 
//             onClick={handleLogout}
//             className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//           >
//             Log Out
//           </button>
//           <button 
//             onClick={handleStayLoggedIn}
//             className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
//           >
//             Stay Logged In
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SessionExpireAlert;


import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { refreshTokenSuccess, logout, setWarningShown } from '../store/authSlice';
import { safeApiCall } from '../utils/errorHandler.js';

const SessionExpireAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds warning
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector(state => state.auth.status);
  const tokenInfo = useSelector(state => state.auth.tokenInfo);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  
  useEffect(() => {
    if (!authStatus || !tokenInfo?.accessTokenExpiry) {
      // console.log('SessionExpireAlert: No auth or token info, returning');
      return;
    }
    
    const checkTokenExpiry = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(tokenInfo.accessTokenExpiry).getTime();
      const timeUntilExpiry = expiryTime - now;
      
      // console.log('SessionExpireAlert: Checking token expiry');
      // console.log('Time until expiry:', Math.floor(timeUntilExpiry / 1000 / 60), 'minutes');
      
      // Clear any existing timers
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      // If token already expired, logout immediately
      if (timeUntilExpiry <= 0) {
        // console.log('Token already expired, logging out');
        dispatch(logout());
        navigate('/login');
        return;
      }
      
      const warningTime = timeUntilExpiry - 60000; // Changed to 1 minute for testing
      
      if (warningTime > 0) {
        // console.log('Setting warning timer for:', warningTime / 1000, 'seconds');
        // Set timer to show warning
        warningTimerRef.current = setTimeout(() => {
          // console.log('Warning timer triggered!');
          setShowAlert(true);
          dispatch(setWarningShown(true));
          setCountdown(60); // Start from 60 seconds
          
          // console.log('Starting countdown from 60 seconds');
          // Start countdown
          countdownIntervalRef.current = setInterval(() => {
            setCountdown(prev => {
              // console.log('Countdown:', prev);
              if (prev <= 1) {
                // Time's up - logout
                // console.log('Countdown finished, logging out');
                clearInterval(countdownIntervalRef.current);
                dispatch(logout());
                navigate('/login');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }, warningTime);
      } else {
        // Less than warning time remaining, show warning immediately
        // console.log('Less than warning time remaining, showing warning immediately');
        setShowAlert(true);
        dispatch(setWarningShown(true));
        
        // Calculate actual seconds remaining
        const secondsRemaining = Math.max(Math.floor(timeUntilExpiry / 1000), 60);
        // console.log('Setting countdown to:', Math.min(secondsRemaining, 60));
        setCountdown(Math.min(secondsRemaining, 60)); // Cap at 60 seconds
        
        // Start countdown
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prev => {
            // console.log('Countdown:', prev);
            if (prev <= 1) {
              // console.log('Countdown finished, logging out');
              clearInterval(countdownIntervalRef.current);
              dispatch(logout());
              navigate('/login');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    };
    
    checkTokenExpiry();
    
    // Clean up timers on unmount
    return () => {
      // console.log('SessionExpireAlert: Cleaning up timers');
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [authStatus, tokenInfo?.accessTokenExpiry, tokenInfo?.warningShown, dispatch, navigate]);

  const handleStayLoggedIn = async () => {
    try {
      // Use safeApiCall for consistent error handling
      const response = await safeApiCall(
        () => axios.post(
          `${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/users/refresh-token`,
          {},
          { withCredentials: true }
        ),
        // Custom error handler for token refresh
        async (error) => {
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.error('Token refresh failed - unauthorized');
            dispatch(logout());
            navigate('/login');
            return true; // Mark as handled
          }
          return false; // Let default handler show toast for other errors
        }
      );
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Update Redux with new token info
        dispatch(refreshTokenSuccess({
          accessToken: data.accessToken,
          accessTokenExpiry: data.accessTokenExpiry,
          refreshTokenExpiry: data.refreshTokenExpiry,
          refreshTime: data.refreshTime
        }));
        
        // Hide alert and reset countdown
        setShowAlert(false);
        setCountdown(60);
        dispatch(setWarningShown(false));
        
        // Clear existing timers
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        
        console.log('Session refreshed successfully');
      } else {
        console.error('Token refresh response not successful');
        dispatch(logout());
        navigate('/login');
      }
    } catch (error) {
      // Error already handled by safeApiCall and custom handler
      console.error('Failed to refresh session:', error);
      dispatch(logout());
      navigate('/login');
    }
  };
  
  const handleLogout = () => {
    // Clear timers before logout
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    dispatch(logout());
    navigate('/login');
  };
  
  if (!showAlert) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md shadow-xl">
        <h3 className="text-xl font-bold text-dark mb-4">Session Expiring Soon</h3>
        <p className="text-gray-600 mb-6">
          Your session will expire in {countdown} seconds. Would you like to stay logged in?
        </p>
        <div className="flex justify-between">
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Log Out
          </button>
          <button 
            onClick={handleStayLoggedIn}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpireAlert;