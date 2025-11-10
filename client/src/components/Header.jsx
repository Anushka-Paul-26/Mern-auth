import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets.js';
import { AppContent } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { isLoggedin, userData } = useContext(AppContent);
  const [userName, setUserName] = useState('Developer');
  const navigate = useNavigate();

  // Update userName whenever login state or user data changes
  useEffect(() => {
    setUserName(isLoggedin && userData?.name ? userData.name : 'Developer');
  }, [isLoggedin, userData]);

  return (
    <div className='flex flex-col md:flex-row items-center justify-center gap-10 mt-32 px-10'>
      <div className='space-y-4 max-w-lg text-center md:text-left'>
        {/* Greeting Text */}
        <p className='text-gray-700 text-2xl font-medium'>
          Hey {userName} 👋
        </p>

        <h1 className='text-5xl font-bold leading-tight'>
          Welcome to <span className='text-blue-600'>Auth System</span> 🚀
        </h1>

        <p className='text-gray-600 text-lg'>
          Secure Login, Email Verification, and Password Recovery System.
          Built using MERN, JWT & Tailwind CSS.
        </p>

        <button
          onClick={() => navigate(isLoggedin ? '/dashboard' : '/login')}
          className='bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition'
        >
          {isLoggedin ? "Go to Dashboard" : "Get Started"}
        </button>
      </div>

      <img
        src={assets.header_img}
        alt="Auth System Header"
        className='w-[350px] md:w-[450px] drop-shadow-2xl'
      />
    </div>
  );
};

export default Header;
