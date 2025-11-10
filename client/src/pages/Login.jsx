import React, { useState, useContext } from "react";
import { assets } from "../assets/assets.js";
import { Link, useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [state, setState] = useState("Sign Up"); // "Login" or "Sign Up"
  const navigate = useNavigate();

  // Access backend URL and context values
  const { backendUrl, setIsLoggedin, setUserData, getUserdata } =
    useContext(AppContent);

  // Handle login / signup form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    const endpoint =
      state === "Login"
        ? `${backendUrl}/api/auth/login`
        : `${backendUrl}/api/auth/register`;

    try {
      const { data } = await axios.post(endpoint, formValues, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (data.success) {
        toast.success(
          state === "Login"
            ? "Login successful! 🎉"
            : "Account created successfully! Verify your email 📧"
        );

        setIsLoggedin(true);
        setUserData(data.user || {});

        if (state === "Login") {
          await getUserdata();
          navigate("/"); // or /dashboard
        } else {
          navigate("/email-verify");
        }
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Server error, please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-gradient-to-br from-blue-200 to-purple-400">
      {/* Card */}
      <div className="bg-slate-900 p-10 rounded-2xl shadow-2xl w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-center text-2xl font-bold text-white mb-1">
          {state === "Sign Up" ? "Create Account" : "Welcome Back!"}
        </h2>
        <p className="text-center text-gray-400 mb-6">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account"}
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name (Sign Up only) */}
          {state === "Sign Up" && (
            <div className="flex items-center gap-3 w-full px-4 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="person" className="w-5" />
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                className="bg-transparent outline-none text-white w-full"
                required
              />
            </div>
          )}

          {/* Email */}
          <div className="flex items-center gap-3 w-full px-4 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="mail" className="w-5" />
            <input
              name="email"
              type="email"
              placeholder="Email ID"
              className="bg-transparent outline-none text-white w-full"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 w-full px-4 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="lock" className="w-5" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none text-white w-full"
              required
            />
          </div>

          {/* Forgot Password (Login only) */}
          {state === "Login" && (
            <div className="flex justify-end">
              <Link
                to="/reset-password"
                className="text-sm text-blue-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all duration-300"
          >
            {state === "Sign Up" ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* Toggle Section */}
        <div className="text-center mt-6 text-gray-300 text-sm">
          {state === "Sign Up" ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setState("Login")}
                className="text-blue-300 hover:underline"
              >
                Login here
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setState("Sign Up")}
                className="text-blue-300 hover:underline"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
