import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button, Input } from "@windmill/react-ui";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useLoginSubmit from "@/hooks/useLoginSubmit";

//internal import
import Error from "@/components/form/others/Error";
import ImageLight from "@/assets/img/login-office.jpeg";
import ImageDark from "@/assets/img/login-office-dark.jpeg";
import Loader from "@/components/sprinkleLoader/Loader";
import { FiMail } from "react-icons/fi";
import { notifyError, notifySuccess } from "@/utils/toast";
import ThemeToggle from "@/components/theme/ThemeToggle";

const Login = () => {
  const { t } = useTranslation();
  const { 
    onSubmit, 
    register, 
    handleSubmit, 
    errors, 
    loading, 
    otpRequired, 
    userEmail,
    resetOtpState,
    resendLoginOtp
  } = useLoginSubmit();
  const [showPassword, setShowPassword] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30); // 30 seconds cooldown for resend
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    document.title = "Infidea CRM | Login";
  }, []);

  // Set up timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpRequired && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, otpRequired]);

  // Reset timer when OTP verification is triggered
  useEffect(() => {
    if (otpRequired) {
      setTimer(30);
    }
  }, [otpRequired]);

  const handleResendOtp = async () => {
    setResending(true);
    
    try {
      const res = await resendLoginOtp();
      
      if (res.success) {
        notifySuccess(res.message || "OTP resent successfully");
        setTimer(30); // Reset the timer
      } else {
        notifyError(res.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      notifyError("An unexpected error occurred. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center min-h-screen p-2 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden rounded-xl shadow-lg bg-white dark:bg-gray-800">
        <div className="flex flex-col md:flex-row">
          <div className="relative h-32 md:h-auto md:w-5/12">
            <img
              aria-hidden="true"
              className="object-cover w-full h-full dark:hidden"
              src={ImageLight}
              alt="Office"
            />
            <img
              aria-hidden="true"
              className="hidden object-cover w-full h-full dark:block"
              src={ImageDark}
              alt="Office"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 to-indigo-700/70 flex items-center justify-center">
              <div className="px-4 py-2 text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Infidea CRM</h1>
                <p className="text-white text-xs sm:text-sm opacity-90">
                  Your all-in-one customer relationship solution
                </p>
                <div className="mt-2 hidden sm:flex flex-col space-y-0.5">
                  <div className="flex items-center text-white text-xs">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Seamless collaboration</span>
                  </div>
                  <div className="flex items-center text-white text-xs">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center text-white text-xs">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Enterprise security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <main className="flex items-center justify-center p-4 sm:p-6 md:p-8 md:w-7/12 relative">
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
              <ThemeToggle />
            </div>

            <div className="w-full max-w-xs mx-auto">
              <h1 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-200">
                {otpRequired ? "Enter Verification Code" : "Login"}
              </h1>
              {!otpRequired && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Access to your account
                </p>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {otpRequired ? (
                  <>
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Verification code sent to: Administrators
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-0.5">
                        Verification Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <svg className="h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        </div>
                        <Input
                          {...register("otp", {
                            required: "Verification code is required!",
                          })}
                          type="text"
                          autoComplete="one-time-code"
                          placeholder="Enter code"
                          className="pl-7 pr-2 py-2 h-9 sm:h-8 text-sm w-full"
                        />
                      </div>
                      <Error errorName={errors.otp} />
                    </div>

                    <div className="mt-1">
                      {timer > 0 ? (
                        <div className="flex items-center">
                          <p className="text-xs text-indigo-500 dark:text-indigo-400">
                            Resend in {timer}s
                          </p>
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          onClick={handleResendOtp}
                          disabled={resending}
                          className="text-xs font-medium text-indigo-500 dark:text-indigo-400 hover:underline"
                        >
                          {resending ? (
                            <span className="flex items-center">
                              <Loader size="16" /> Sending...
                            </span>
                          ) : (
                            "Resend code"
                          )}
                        </button>
                      )}
                    </div>
                    
                    {loading ? (
                      <div className="flex justify-center my-1">
                        <Loader size="20" />
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2 mt-2">
                        <Button
                          type="submit"
                          className="w-full my-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-2 px-3 rounded-md transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm h-9 sm:h-8"
                        >
                          Verify
                        </Button>
                        
                        <Button
                          type="button"
                          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 text-sm py-2 px-3 rounded-md h-9 sm:h-8"
                          onClick={resetOtpState}
                        >
                          Back
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-0.5">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <FiMail className="h-3 w-3 text-gray-400" />
                        </div>
                        <Input
                          {...register("email", {
                            required: "Email is required!",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address!",
                            },
                          })}
                          type="email"
                          placeholder="your@email.com"
                          className="pl-7 py-2 h-9 sm:h-8 text-sm w-full"
                        />
                      </div>
                      <Error errorName={errors.email} />
                    </div>
                    
                    {/* Password Field */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-0.5">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <svg className="h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <Input
                          {...register("password", {
                            required: "Password is required!",
                          })}
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          className="pl-7 pr-7 py-1 h-7 text-sm w-full"
                        />
                        <button 
                          type="button"
                          className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                      <Error errorName={errors.password} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          {...register("remember_me")}
                          type="checkbox"
                          className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-1 block text-xs text-gray-700 dark:text-gray-400">
                          Remember me
                        </label>
                      </div>
                      <div>
                        <Link
                          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                          to="/forgot-password"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                    
                    {loading ? (
                      <div className="flex justify-center my-1">
                        <Loader size="20" />
                      </div>
                    ) : (
                      <Button
                        type="submit"
                        className="w-full my-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-1 px-3 rounded-md transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm h-7"
                      >
                        Login
                      </Button>
                    )}
                    
                    <div className="flex justify-center mt-3 text-xs">
                      <p className="text-gray-600 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link
                          className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                          to="/signup"
                        >
                          Sign Up
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Login;
