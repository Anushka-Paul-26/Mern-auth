import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { AppContent } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const { isLoggedin, setIsLoggedin, userData, setUserData, backendUrl } =
    useContext(AppContent);

  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Logged out successfully!");
        setIsLoggedin(false);
        setUserData({});
        setShowMenu(false);
        navigate("/", { replace: true });
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed!");
    }
  };

  const userInitial = userData?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div
      className="w-full flex justify-between items-center px-6 sm:px-24 py-4 
      absolute top-0 bg-gradient-to-b from-blue-100/70 to-transparent
      backdrop-blur-lg shadow-sm"
    >
      <Link to="/">
        <img
          src={assets.logo}
          alt="Logo"
          className="w-32 cursor-pointer hover:scale-105 transition duration-300"
        />
      </Link>

      {isLoggedin ? (
        <div className="relative" ref={menuRef}>
          <div
            className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center 
            cursor-pointer font-semibold text-lg shadow-md"
            onClick={toggleMenu}
          >
            {userInitial}
          </div>

          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-44 bg-white text-gray-700 rounded-lg shadow-lg py-2 z-50"
            >
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  navigate("/email-verify");
                  setShowMenu(false);
                }}
              >
                Verify Email
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login">
          <button
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-white text-blue-700
            border border-blue-300 font-medium
            hover:bg-blue-200 hover:shadow-lg hover:scale-105
            transition-all duration-300"
          >
            Login
            <img src={assets.arrow_icon} alt="" className="w-4" />
          </button>
        </Link>
      )}
    </div>
  );
};

export default Navbar;
