import Navbar from './commons/Navbar'
import {Route, Routes, useNavigate, Outlet } from 'react-router-dom'
import {login, logout} from "./store/authSlice.js"
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import axios from 'axios';
import SessionExpireAlert from './session/SessionExpireAlert';
import { SpeedInsights } from '@vercel/speed-insights/react';
import toast, { Toaster } from "react-hot-toast";

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [authChecking, setAuthChecking] = useState(true)
  const authStatus = useSelector(state => state.auth.status); // Add this

const checkAuthStatus = async () => {
  try {
    // console.log("Checking auth status...");
    
    const userResponse = await axios.get(
      `${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/users/me`, 
      { withCredentials: true }
    );
    
    if (userResponse.data && userResponse.data.data) {
      const { user, tokenInfo } = userResponse.data.data;
      // console.log("User authenticated:", user);
      // console.log("Token info from server:", tokenInfo);
      
      // User is authenticated - dispatch with token info from server
      dispatch(login({
        user,
        accessTokenExpiry: tokenInfo?.accessTokenExpiry,
        refreshTokenExpiry: tokenInfo?.refreshTokenExpiry,
        loginTime: user.lastLoginDate
      }));
      
      // Check if token is about to expire
      if (tokenInfo?.accessTokenExpiry) {
        const expiryTime = new Date(tokenInfo.accessTokenExpiry).getTime();
        const currentTime = new Date().getTime();
        const timeUntilExpiry = expiryTime - currentTime;
        
        // console.log("Time until token expiry:", timeUntilExpiry / 1000 / 60, "minutes");
      }
      
      return true;
    } else {
      // console.log("Auth response without user data:", userResponse.data);
      dispatch(logout());
      return false;
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    dispatch(logout());
    return false;
  }
};

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error("Auth check completely failed:", error);
        dispatch(logout());
      } finally {
        setAuthChecking(false);
      }
    };
  
    fetchUser();
  }, [dispatch]);

  // Show loading state only briefly while checking authentication
  if (authChecking) {
    // Set a timeout to stop showing loading after 2 seconds even if auth check is still pending
    setTimeout(() => {
      setAuthChecking(false);
    }, 2000);
    
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#4ade80',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      <Navbar />
      
      {/* Add SessionExpireAlert component when user is authenticated */}
      {authStatus && <SessionExpireAlert />}
      
      <main>
        <Outlet />
      </main>

      <SpeedInsights />
    </>
  )
}

export default App