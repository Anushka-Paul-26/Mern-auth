import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState({});

  // Fetch user data
  const getUserdata = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/is-auth`, {
        withCredentials: true, // important to send cookies
      });

      if (data.success) {
        setUserData(data.userData);
      } else {
        setUserData({});
      }
    } catch (error) {
      setUserData({});
      // optional: toast.error(error.response?.data?.message || error.message);
    }
  };

  // Check if user is authenticated
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true, // critical for cookies
      });

      if (data.success) {
        setIsLoggedin(true);
        getUserdata(); // fetch user info
      } else {
        setIsLoggedin(false);
        setUserData({});
      }
    } catch (error) {
      // ❌ If 401 or error, reset state
      setIsLoggedin(false);
      setUserData({});
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  return (
    <AppContent.Provider
      value={{
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserdata,
      }}
    >
      {children}
    </AppContent.Provider>
  );
};
