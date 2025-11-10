import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EmailVerify = () => {
  axios.defaults.withCredentials = true;
  const { backendUrl, getUserdata } = useContext(AppContent);
  const navigate = useNavigate();
  const inputRefs = React.useRef([]);

  // ✅ Auto redirect if already verified
  useEffect(() => {
    const checkVerified = async () => {
      try {
        const { data } = await axios.get(backendUrl + "/api/auth/me", {
          withCredentials: true,
        });
        if (data.success && data.user?.isAccountVerified) {
          navigate("/");
        }
      } catch (error) {
        console.log("User not logged in or error checking verification");
      }
    };
    checkVerified();
  }, [backendUrl, navigate]);

  // ✅ Send OTP when component loads
  useEffect(() => {
    const sendOtp = async () => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/auth/send-verify-otp",
          {},
          { withCredentials: true }
        );
        if (data.success) {
          toast.success(data.message);
          console.log("📩 OTP sent to email");
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send OTP");
        console.error("❌ Error sending OTP:", error);
      }
    };
    sendOtp();
  }, [backendUrl]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");

      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("✅ Email verified successfully!");
        navigate("/");
        getUserdata();

        // 🕒 Redirect after 1.5 seconds
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400 relative px-4">
      {/* Logo */}
      <div className="absolute top-6 left-6 sm:left-16">
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
          alt="Logo"
          className="w-24 sm:w-32 cursor-pointer hover:scale-105 transition"
        />
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-md text-sm mt-28 sm:mt-0"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code sent to your email id.
        </p>

        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>

        <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:scale-[1.02] transition-all duration-200">
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
