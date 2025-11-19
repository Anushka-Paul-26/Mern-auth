import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState({});

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedin(true);
        setUserData(data.userData); // 🔥 important fix
      } else {
        setIsLoggedin(false);
        setUserData({});
      }
    } catch (error) {
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
      }}
    >
      {children}
    </AppContent.Provider>
  );
};
